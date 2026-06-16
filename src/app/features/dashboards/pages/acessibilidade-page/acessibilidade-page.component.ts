import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyComponent, PlotlyService } from 'angular-plotly.js';

import { AcessibilidadeFacade } from '../../facades/acessibilidade.facade';
import { PlotlyFigure } from '../../../../core/api/models/plotly-figure';
import {
  ClassificacaoAcessibilidadeModel,
  MapaPontoModel,
  MetricaFiltroModel,
  MunicipioFiltroModel,
} from '../../models/acessibilidade.models';
import type { Paginacao } from '../../../../core/api/models/paginacao';
import { AppInputComponent } from '../../../../shared/ui/input/app-input.component';

PlotlyService.setPlotly(PlotlyJS);

type GraficoApresentacao = {
  chave: string;
  titulo: string;
  tipo: string;
  plotly: PlotlyFigure;
};

const SCORE_INTERVALO: Record<ClassificacaoAcessibilidadeModel, string> = {
  Boa: '8–11',
  Média: '5–7',
  Baixa: '1–4',
  Inexistente: '0',
};

@Component({
  selector: 'app-acessibilidade-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PlotlyComponent, AppInputComponent],
  templateUrl: './acessibilidade-page.component.html',
  styleUrl: './acessibilidade-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcessibilidadePageComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly facade = inject(AcessibilidadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);
  private map?: L.Map;
  private municipalitiesLayer?: L.GeoJSON;
  private schoolMarkersLayer?: L.FeatureGroup;

  protected anos: number[] = [];
  protected municipios: MunicipioFiltroModel[] = [];
  protected metricas: MetricaFiltroModel[] = [];
  protected graficos: GraficoApresentacao[] = [];
  protected graficosAnaliseTemporal: GraficoApresentacao[] = [];
  protected redesEnsino: string[] = [];
  protected tpLocalizacoes: string[] = [];
  protected selectedAno: number | null = null;
  protected selectedMunicipios: string[] = [];
  protected selectedMetricas: string[] = [];
  protected selectedRedeEnsino: string[] = [];
  protected selectedTpLocalizacao: string[] = [];

  protected isLoading = true;
  protected painelDescricao: string = '';
  protected analiseTemporalDescricao: string = '';

  protected readonly graficoPainelEscolas = signal<GraficoApresentacao | null>(null);
  protected readonly painelEscolasPaginacao = signal<Paginacao | null>(null);
  protected readonly painelEscolasPage = signal(0);
  protected readonly painelEscolasPageSize = 5;

  private readonly painelEscolasLoad$ = new Subject<{
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
    page?: number;
    page_size?: number;
  }>();

  protected searchTerm: string = '';
  protected searchResults: MapaPontoModel[] = [];
  protected searchPage = 1;
  protected readonly searchPageSize = 5;
  private readonly searchSubject = new Subject<string>();

  protected selectedClassificacoes: string[] = [];
  protected readonly classificacoesDisponiveis: ClassificacaoAcessibilidadeModel[] = [
    'Boa',
    'Média',
    'Baixa',
    'Inexistente',
  ];

  protected rankingPage = 1;
  protected readonly rankingPageSize = 10;

  private allSchools: MapaPontoModel[] = [];
  private _rankingEscolas: MapaPontoModel[] = [];
  private schoolMarkersById = new Map<number, L.Marker>();

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (this.map) return;
    this.map = L.map(this.mapContainer.nativeElement, {
      center: L.latLng(-3.5, -52.5),
      zoom: 6,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map!);

    if (this.anos.length > 0) {
      void this.loadMap(this.buildParams());
    }
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscarEscola());

    this.painelEscolasLoad$
      .pipe(
        switchMap((params) => this.facade.listarPainelEscolas(params)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.graficoPainelEscolas.set({
          chave: 'painel_escolas',
          titulo: result.grafico.titulo,
          tipo: result.grafico.tipo,
          plotly: this.normalizarGraficoPlotly(result.grafico.plotly),
        });
        this.painelEscolasPaginacao.set(result.paginacao);
      });

    this.definirAnoPadrao();
    const params = this.buildParams();

    this.facade
      .listarFiltros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filtros) => {
        this.anos = Array.from(
          new Set(
            (filtros.anos ?? []).map((ano) => Number(ano)).filter((ano) => Number.isFinite(ano)),
          ),
        ).sort((a, b) => b - a);
        this.municipios = (filtros.municipios ?? []).map((municipio) => ({
          codigo: Number(municipio.codigo),
          nome: String(municipio.nome),
        }));
        this.metricas = (filtros.metricas ?? []).map((metrica) => ({
          chave: String(metrica.chave),
          label: String(metrica.label),
        }));
        this.selectedMetricas = [];
        this.redesEnsino = (filtros.rede_ensino ?? []).map((rede) => String(rede));
        this.tpLocalizacoes = (filtros.tp_localizacao ?? []).map((loc) => String(loc));
        this.isLoading = false;

        if (this.map) {
          void this.loadMap(params);
        }

        this.loadAnaliseTemporal({ metrica: this.getMetricaAnaliseTemporal() });
        this.loadPainelEscolas(params);
        this.cd.markForCheck();
      });

    this.facade
      .listarPainel(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.graficos = this.mapGraficosPainel(painel.graficos ?? {});
        this.painelDescricao = painel.descricao ?? '';
        this.cd.markForCheck();
      });
  }

  protected onAnoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAno = val ? Number(val) : null;
  }

  protected aplicarFiltros(): void {
    const params = this.buildParams();
    void this.loadPainel(params);
    void this.loadMap(params);
    this.loadAnaliseTemporal({ metrica: this.getMetricaAnaliseTemporal() });
    this.painelEscolasPage.set(0);
    this.loadPainelEscolas(params);
  }

  protected resetFiltros(): void {
    this.selectedMetricas = [];
    this.selectedMunicipios = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
    this.selectedClassificacoes = [];
    this.definirAnoPadrao();
    this.cd.markForCheck();
    this.aplicarFiltros();
  }

  protected onMunicipioChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedMunicipios = Array.from(select.selectedOptions)
      .map((option) => option.value)
      .filter((value) => value.length > 0);
  }

  protected onMetricaChange(metrica: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedMetricas.includes(metrica)) {
        this.selectedMetricas = [...this.selectedMetricas, metrica];
      }
    } else {
      this.selectedMetricas = this.selectedMetricas.filter((m) => m !== metrica);
    }
  }

  protected onRedeEnsinoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedRedeEnsino = Array.from(select.selectedOptions)
      .map((option) => option.value)
      .filter((value) => value.length > 0);
  }

  protected onTpLocalizacaoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedTpLocalizacao = Array.from(select.selectedOptions)
      .map((option) => option.value)
      .filter((value) => value.length > 0);
  }

  protected toggleValue(values: string[], value: string): void {
    const index = values.indexOf(value);

    if (index >= 0) {
      values.splice(index, 1);
    } else {
      values.push(value);
    }

    this.cd.markForCheck();
  }

  protected removeValue(values: string[], value: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const index = values.indexOf(value);
    if (index >= 0) {
      values.splice(index, 1);
    }

    this.cd.markForCheck();
  }

  protected visibleValues(values: string[], limit: number): string[] {
    return values.slice(0, limit);
  }

  protected hiddenCount(values: string[], visibleLimit: number): number {
    return Math.max(values.length - visibleLimit, 0);
  }

  protected visibleMetricLabels(limit: number): MetricaFiltroModel[] {
    const metricasByKey = new Map(this.metricas.map((metrica) => [metrica.chave, metrica]));

    return this.selectedMetricas.slice(0, limit).map((chave) => ({
      chave,
      label: metricasByKey.get(chave)?.label ?? chave,
    }));
  }

  protected toggleClassificacaoEBuscar(classificacao: string): void {
    this.toggleValue(this.selectedClassificacoes, classificacao);
    this.buscarEscola();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  protected buscarEscola(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    const temFiltroClassificacao = this.selectedClassificacoes.length > 0;

    if (termo.length === 0 && !temFiltroClassificacao) {
      this.searchResults = [];
      this.searchPage = 1;
      this.cd.markForCheck();
      return;
    }

    let resultado = this.allSchools;

    if (termo.length > 0) {
      resultado = resultado.filter((escola) =>
        String(escola.nome ?? '')
          .toLowerCase()
          .includes(termo),
      );
    }

    if (temFiltroClassificacao) {
      resultado = resultado.filter((escola) =>
        this.selectedClassificacoes.includes(String(escola.classificacao ?? '')),
      );
    }

    this.searchResults = resultado;
    this.searchPage = 1;
    this.cd.markForCheck();
  }

  protected get paginatedSearchResults(): MapaPontoModel[] {
    const start = (this.searchPage - 1) * this.searchPageSize;
    return this.searchResults.slice(start, start + this.searchPageSize);
  }

  protected get totalSearchPages(): number {
    return Math.max(Math.ceil(this.searchResults.length / this.searchPageSize), 1);
  }

  protected get searchPageNumbers(): number[] {
    const visiblePages = 3;
    const totalPages = this.totalSearchPages;
    const halfWindow = Math.floor(visiblePages / 2);
    const start = Math.min(
      Math.max(this.searchPage - halfWindow, 1),
      Math.max(totalPages - visiblePages + 1, 1),
    );
    const end = Math.min(start + visiblePages - 1, totalPages);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  protected setSearchPage(page: number): void {
    this.searchPage = Math.min(Math.max(page, 1), this.totalSearchPages);
    this.cd.markForCheck();
  }

  protected get rankingEscolas(): MapaPontoModel[] {
    return this._rankingEscolas;
  }

  protected get rankingPaginado(): MapaPontoModel[] {
    const start = (this.rankingPage - 1) * this.rankingPageSize;
    return this._rankingEscolas.slice(start, start + this.rankingPageSize);
  }

  protected get rankingTotalPages(): number {
    return Math.max(Math.ceil(this._rankingEscolas.length / this.rankingPageSize), 1);
  }

  protected get rankingPageNumbers(): number[] {
    const visiblePages = 5;
    const totalPages = this.rankingTotalPages;
    const halfWindow = Math.floor(visiblePages / 2);
    const start = Math.min(
      Math.max(this.rankingPage - halfWindow, 1),
      Math.max(totalPages - visiblePages + 1, 1),
    );
    const end = Math.min(start + visiblePages - 1, totalPages);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  protected setRankingPage(page: number): void {
    this.rankingPage = Math.min(Math.max(page, 1), this.rankingTotalPages);
    this.cd.markForCheck();
  }

  protected scoreIntervaloLabel(classificacao: ClassificacaoAcessibilidadeModel | string): string {
    return SCORE_INTERVALO[classificacao as ClassificacaoAcessibilidadeModel] ?? '—';
  }

  protected scoreBadgeClass(escola: MapaPontoModel): string {
    const classificacao = String(escola.classificacao ?? '').toLowerCase();
    const score = Number(escola.score);

    if (classificacao.includes('boa') || score >= 8) {
      return 'score-badge--alta';
    }

    if (classificacao.includes('média') || classificacao.includes('media') || score >= 5) {
      return 'score-badge--media';
    }

    if (classificacao.includes('baixa') || score > 0) {
      return 'score-badge--baixa';
    }

    return 'score-badge--muito-baixa';
  }

  protected mostrarEscola(escola: MapaPontoModel): void {
    if (!this.map || !Number.isFinite(escola.latitude) || !Number.isFinite(escola.longitude)) {
      this.cd.markForCheck();
      return;
    }

    this.map.setView([escola.latitude, escola.longitude], 15);
    const marker = this.getOrCreateSchoolMarker(escola);
    if (marker) {
      marker.openPopup();
    }

    this.cd.markForCheck();
  }

  protected fecharPopups(): void {
    for (const marker of this.schoolMarkersById.values()) {
      marker.closePopup();
    }

    this.cd.markForCheck();
  }

  private definirAnoPadrao(): void {
    this.selectedAno = 2024;
  }

  private buildParams(): {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  } {
    return {
      ano: this.selectedAno ?? null,
      variaveis: this.selectedMetricas.length ? this.selectedMetricas : null,
      municipios: this.selectedMunicipios.length ? this.selectedMunicipios : null,
      rede_ensino: this.selectedRedeEnsino.length ? this.selectedRedeEnsino : null,
      tp_localizacao: this.selectedTpLocalizacao.length ? this.selectedTpLocalizacao : null,
    };
  }

  private mapGraficosPainel(
    graficos: Record<string, { titulo: string; tipo: string; plotly: PlotlyFigure }>,
  ): GraficoApresentacao[] {
    return Object.entries(graficos).map(([chave, grafico]) => ({
      chave,
      titulo: grafico.titulo,
      tipo: grafico.tipo,
      plotly: this.normalizarGraficoPlotly(grafico.plotly),
    }));
  }

  private normalizarGraficoPlotly(figure: PlotlyFigure): PlotlyFigure {
    const layout = { ...(figure.layout ?? {}) };
    const originalMargin = (layout['margin'] ?? {}) as Record<string, unknown>;
    const hasIndicator = (figure.data ?? []).some((trace) => trace['type'] === 'indicator');
    const originalTopMargin = Number(originalMargin['t'] ?? 24);

    delete layout['title'];
    delete layout['margin'];

    return {
      ...figure,
      layout: {
        ...layout,
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
          family: "Inter, 'Segoe UI', Roboto, Arial, sans-serif",
          color: '#26395f',
          size: 12,
          ...(layout['font'] ?? {}),
        },
        margin: {
          ...(originalMargin ?? {}),
          l: hasIndicator ? 20 : 58,
          r: 18,
          t: hasIndicator ? 12 : Math.min(originalTopMargin, 32),
          b: hasIndicator ? 24 : 58,
          pad: 0,
        },
      },
    };
  }

  private loadPainel(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
  }): void {
    this.facade
      .listarPainel(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.graficos = this.mapGraficosPainel(painel.graficos ?? {});
        this.painelDescricao = painel.descricao ?? '';
        this.cd.markForCheck();
      });
  }

  protected setPainelEscolasPage(delta: number): void {
    const total = this.painelEscolasPaginacao()?.total_paginas ?? 1;
    const current = this.painelEscolasPage();
    const next = Math.max(0, Math.min(current + delta, total - 1));
    if (next === current) return;
    this.painelEscolasPage.set(next);
    this.loadPainelEscolas({ ...this.buildParams(), page: next });
  }

  private loadPainelEscolas(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
    page?: number;
  }): void {
    this.painelEscolasLoad$.next({ ...params, page_size: this.painelEscolasPageSize });
  }

  private loadAnaliseTemporal(params?: { metrica?: string | null }): void {
    this.facade
      .listarAnaliseTemporal(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((analiseTemporal) => {
        this.graficosAnaliseTemporal = analiseTemporal.listaGraficos.map((grafico) => ({
          chave: grafico.chave,
          titulo: grafico.titulo,
          tipo: grafico.tipo,
          plotly: grafico.plotly,
        }));
        this.analiseTemporalDescricao = analiseTemporal.descricao ?? '';
        this.cd.markForCheck();
      });
  }

  private getMetricaAnaliseTemporal(): string | null {
    if (this.selectedMetricas.length > 0) {
      return this.selectedMetricas[0];
    }

    return this.metricas[0]?.chave ?? null;
  }

  private async loadMap(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
  }): Promise<void> {
    const { collection, pontos } = await firstValueFrom(
      this.facade.listarMapaMunicipalGeoJsonComPontos(params),
    );
    const shouldShowSchools = (params?.municipios?.length ?? 0) > 0;

    this.municipalitiesLayer?.remove();
    this.schoolMarkersLayer?.remove();

    const geoJsonCollection: Parameters<typeof L.geoJSON>[0] = collection;

    for (const marker of this.schoolMarkersById.values()) {
      marker.remove();
    }
    this.schoolMarkersById.clear();

    this.municipalitiesLayer = L.geoJSON(geoJsonCollection, {
      style: (feature) => {
        const cor = String(feature?.properties?.['cor'] ?? '#94a3b8');
        return {
          color: cor,
          fillColor: cor,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.65,
        };
      },
      onEachFeature: (feature, layer) => {
        const nome = String(feature.properties?.['NM_MUN'] ?? 'Município');
        const score = Number(feature.properties?.['media_score'] ?? 0).toFixed(2);
        const classificacao = String(
          feature.properties?.['classificacao_acessibilidade_municipio'] ?? 'Inexistente',
        );
        const escolas = Number(feature.properties?.['quantidade_escolas'] ?? 0);

        layer.bindTooltip(
          `${nome}<br>Score médio: ${score}<br>Classificação: ${classificacao}<br>Escolas: ${escolas}`,
          {
            sticky: true,
          },
        );
      },
    }).addTo(this.map!);

    const pontosValidos = pontos.filter(
      (ponto) => Number.isFinite(ponto.latitude) && Number.isFinite(ponto.longitude),
    );
    this.allSchools = pontosValidos;
    this._rankingEscolas = [...pontosValidos].sort((a, b) => Number(b.score) - Number(a.score));
    this.rankingPage = 1;

    if (shouldShowSchools) {
      const scorePorMunicipio = new Map<string, { min: number; max: number }>();

      for (const ponto of pontosValidos) {
        const municipio = String(ponto.municipio ?? '');
        if (!municipio) {
          continue;
        }

        const score = Number(ponto.score);
        if (!Number.isFinite(score)) {
          continue;
        }

        const atual = scorePorMunicipio.get(municipio) ?? { min: score, max: score };
        atual.min = Math.min(atual.min, score);
        atual.max = Math.max(atual.max, score);
        scorePorMunicipio.set(municipio, atual);
      }

      this.schoolMarkersLayer = L.featureGroup().addTo(this.map!);

      for (const ponto of pontosValidos) {
        const municipio = String(ponto.municipio ?? '');
        const score = Number(ponto.score);
        const faixas = scorePorMunicipio.get(municipio);
        const cor = this.getScoreColor(score, faixas?.min ?? score, faixas?.max ?? score);

        const marker = L.marker([ponto.latitude, ponto.longitude], {
          icon: this.createPinIcon(cor),
        });
        this.schoolMarkersById.set(Number(ponto.co_entidade), marker);

        const nome = String(ponto.nome ?? 'Escola');
        marker.bindPopup(this.buildSchoolPopup(ponto, nome, municipio, score, cor), {
          autoClose: false,
          closeOnClick: false,
          maxWidth: 320,
        });

        marker.addTo(this.schoolMarkersLayer);
      }
    }

    const bounds = this.schoolMarkersLayer?.getBounds() ?? this.municipalitiesLayer.getBounds();
    if (bounds.isValid()) {
      this.map?.fitBounds(bounds, { padding: [16, 16] });
    }

    this.cd.markForCheck();
  }

  private getOrCreateSchoolMarker(escola: MapaPontoModel): L.Marker | null {
    const id = Number(escola.co_entidade);
    const existente = this.schoolMarkersById.get(id);
    if (existente) {
      return existente;
    }

    if (!this.map || !Number.isFinite(escola.latitude) || !Number.isFinite(escola.longitude)) {
      return null;
    }

    const score = Number(escola.score);
    const cor = this.getScoreColor(score, score, score);
    const municipio = String(escola.municipio ?? '');

    const marker = L.marker([escola.latitude, escola.longitude], {
      icon: this.createPinIcon(cor),
    });

    const nome = String(escola.nome ?? 'Escola');
    marker.bindPopup(this.buildSchoolPopup(escola, nome, municipio, score, cor), {
      autoClose: false,
      closeOnClick: false,
      maxWidth: 320,
    });

    this.schoolMarkersById.set(id, marker);
    if (this.schoolMarkersLayer) {
      marker.addTo(this.schoolMarkersLayer);
    } else {
      marker.addTo(this.map);
    }

    return marker;
  }

  private getScoreColor(score: number, minScore: number, maxScore: number): string {
    if (!Number.isFinite(score)) {
      return '#94a3b8';
    }

    if (!Number.isFinite(minScore) || !Number.isFinite(maxScore) || minScore === maxScore) {
      return '#16a34a';
    }

    const progress = Math.max(0, Math.min(1, (score - minScore) / (maxScore - minScore)));
    const hue = Math.round(120 * progress);
    return `hsl(${hue}, 75%, 45%)`;
  }

  private createPinIcon(color: string): L.Icon {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42">
        <path d="M14 41s10-13.2 10-23.8C24 8.4 19.5 3 14 3S4 8.4 4 17.2C4 27.8 14 41 14 41Z" fill="${color}" stroke="#1f2937" stroke-width="1.2"/>
        <circle cx="14" cy="17" r="4.2" fill="#ffffff" fill-opacity="0.95"/>
      </svg>
    `;

    return L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      iconSize: [28, 42],
      iconAnchor: [14, 41],
      popupAnchor: [0, -38],
    });
  }

  private buildSchoolPopup(
    ponto: MapaPontoModel,
    nome: string,
    municipio: string,
    score: number,
    cor: string,
  ): string {
    const classificacao = String(
      ponto.classificacao ?? ponto['classificacao_acessibilidade'] ?? 'Inexistente',
    );
    const intervalo = this.scoreIntervaloLabel(classificacao);

    const details: Array<[string, unknown]> = [
      ['Escola', nome],
      ['Município', municipio || 'Não informado'],
      ['Bairro', ponto.no_bairro ?? 'Não informado'],
      ['Score', `${Number.isFinite(score) ? score.toFixed(2) : '0.00'} (faixa: ${intervalo})`],
      ['Classificação', classificacao],
      ['Rede', ponto.no_tp_dependencia ?? 'Não informado'],
      ['Localização', ponto.no_tp_localizacao ?? 'Não informado'],
      ['Código', ponto.co_entidade ?? 'Não informado'],
    ];

    const escapeHtml = (value: unknown): string =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const rows = details
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
      .map(
        ([label, value]) =>
          `<tr><th style="text-align:left;padding:2px 8px 2px 0;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</th><td style="padding:2px 0;">${escapeHtml(value)}</td></tr>`,
      )
      .join('');

    return `
      <div style="min-width:240px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${escapeHtml(cor)};"></span>
          <strong>${escapeHtml(nome)}</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;line-height:1.35;">${rows}</table>
      </div>
    `;
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
