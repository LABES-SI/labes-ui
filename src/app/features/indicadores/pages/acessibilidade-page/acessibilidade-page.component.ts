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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyComponent, PlotlyService } from 'angular-plotly.js';

import { AcessibilidadeFacade } from '../../facades/acessibilidade.facade';
import { GraficoCardComponent } from '../../../../shared/components/grafico-card/grafico-card.component';
import { PlotlyFigure } from '../../../../core/api/models/plotly-figure';
import {
  MapaPontoModel,
  MetricaFiltroModel,
  MunicipioFiltroModel,
} from '../../models/acessibilidade.models';
import { AppInputComponent } from '../../../../shared/ui/input/app-input.component';

PlotlyService.setPlotly(PlotlyJS);

type GraficoApresentacao = {
  chave: string;
  titulo: string;
  tipo: string;
  plotly: PlotlyFigure;
};

@Component({
  selector: 'app-acessibilidade-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PlotlyComponent, GraficoCardComponent, AppInputComponent],
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

  protected searchTerm: string = '';
  protected searchResults: MapaPontoModel[] = [];
  protected searchPage = 1;
  protected readonly searchPageSize = 5;

  private allSchools: MapaPontoModel[] = [];
  private schoolMarkersById = new Map<number, L.Marker>();

  ngOnDestroy(): void {
    this.map?.remove();
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: L.latLng(-3.5, -52.5),
      zoom: 6,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map!);

    this.loadMap();
  }

  ngOnInit(): void {
    this.facade
      .listarPainel()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        console.debug('painel.dadosFiltros (listarPainel):', painel?.dadosFiltros);
        this.anos = Array.from(
          new Set(
            (painel.dadosFiltros.anos ?? [])
              .map((ano) => Number(ano))
              .filter((ano) => Number.isFinite(ano)),
          ),
        ).sort((a, b) => b - a);
        this.municipios = (painel.dadosFiltros.municipios ?? []).map((municipio) => ({
          codigo: Number(municipio.codigo),
          nome: String(municipio.nome),
        }));

        this.definirAnoPadrao();

        this.metricas = (painel.dadosFiltros.metricas ?? []).map((metrica) => ({
          chave: String(metrica.chave),
          label: String(metrica.label),
        }));
        this.selectedMetricas = [];
        this.redesEnsino = (painel.dadosFiltros.rede_ensino ?? []).map((rede) => String(rede));
        this.tpLocalizacoes = ['Urbana', 'Rural'];
        this.graficos = this.mapGraficosPainel(painel.graficos ?? {});

        this.loadAnaliseTemporal({ metrica: this.getMetricaAnaliseTemporal() });

        this.cd.markForCheck();
      });
  }

  protected onAnoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAno = val ? Number(val) : null;
  }

  protected aplicarFiltros(): void {
    void this.loadPainel(this.buildParams());
    void this.loadMap(this.buildParams());
    this.loadAnaliseTemporal({ metrica: this.getMetricaAnaliseTemporal() });
  }

  protected resetFiltros(): void {
    this.selectedMetricas = [];
    this.selectedMunicipios = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
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

  protected buscarEscola(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    if (termo.length === 0) {
      this.searchResults = [];
      this.searchPage = 1;
      this.cd.markForCheck();
      return;
    }

    this.searchResults = this.allSchools.filter((escola) =>
      String(escola.nome ?? '')
        .toLowerCase()
        .includes(termo),
    );
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
    if (this.anos.length === 0) {
      this.selectedAno = null;
      return;
    }

    this.selectedAno = this.anos[0];
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
        this.cd.markForCheck();
      });
  }

  private loadMap(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  }): void {
    this.facade
      .listarMapaMunicipalGeoJsonComPontos(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ collection, pontos }) => {
        if (!this.map) return;

        if (this.municipalitiesLayer) {
          this.municipalitiesLayer.removeFrom(this.map);
        }
        if (this.schoolMarkersLayer) {
          this.schoolMarkersLayer.removeFrom(this.map);
        }

        this.schoolMarkersById.clear();
        this.allSchools = pontos;

        this.municipalitiesLayer = L.geoJSON(collection as Parameters<typeof L.geoJSON>[0], {
          style: (feature) => ({
            color: '#4a6fa5',
            weight: 1,
            fillColor: (feature?.properties as { cor?: string })?.cor ?? '#cccccc',
            fillOpacity: 0.55,
          }),
        }).addTo(this.map);

        this.schoolMarkersLayer = L.featureGroup().addTo(this.map);

        for (const escola of pontos) {
          if (Number.isFinite(escola.latitude) && Number.isFinite(escola.longitude)) {
            this.getOrCreateSchoolMarker(escola);
          }
        }

        this.cd.markForCheck();
      });
  }

  private loadAnaliseTemporal(params: { metrica?: string | null }): void {
    this.facade
      .listarAnaliseTemporal(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((analise) => {
        this.graficosAnaliseTemporal = (analise.listaGraficos ?? []).map((grafico) => ({
          chave: grafico.chave,
          titulo: grafico.titulo,
          tipo: grafico.tipo,
          plotly: this.normalizarGraficoPlotly(grafico.plotly),
        }));
        this.cd.markForCheck();
      });
  }

  private getMetricaAnaliseTemporal(): string | null {
    if (this.selectedMetricas.length > 0) {
      return this.selectedMetricas[0];
    }
    return this.metricas[0]?.chave ?? null;
  }

  private getOrCreateSchoolMarker(escola: MapaPontoModel): L.Marker | undefined {
    if (!this.map || !this.schoolMarkersLayer) return undefined;

    const existing = this.schoolMarkersById.get(escola.co_entidade);
    if (existing) return existing;

    const classificacao = String(escola.classificacao ?? '');
    const score = Number(escola.score ?? 0).toFixed(1);
    const popup = `
      <strong>${String(escola.nome ?? '')}</strong><br>
      Município: ${String(escola.municipio ?? '—')}<br>
      Score: ${score}<br>
      Classificação: ${classificacao}
    `;

    const marker = L.marker([escola.latitude, escola.longitude])
      .bindPopup(popup)
      .addTo(this.schoolMarkersLayer);

    this.schoolMarkersById.set(escola.co_entidade, marker);
    return marker;
  }
}
