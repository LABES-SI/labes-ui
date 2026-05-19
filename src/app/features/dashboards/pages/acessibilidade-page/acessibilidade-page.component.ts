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
import { firstValueFrom } from 'rxjs';
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

PlotlyService.setPlotly(PlotlyJS);

type GraficoApresentacao = {
  chave: string;
  titulo: string;
  tipo: string;
  plotly: PlotlyFigure;
};

type PontoPopupModel = MapaPontoModel & {
  no_bairro?: unknown;
  no_tp_dependencia?: unknown;
  no_tp_localizacao?: unknown;
  classificacao_acessibilidade?: unknown;
};

@Component({
  selector: 'app-acessibilidade-page',
  standalone: true,
  imports: [CommonModule, PlotlyComponent, GraficoCardComponent],
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
  protected redesEnsino: string[] = [];
  protected tpLocalizacoes: string[] = [];
  protected selectedAno: number | null = null;
  protected selectedMunicipios: string[] = [];
  protected selectedMetrica: string | null = null;
  protected selectedRedeEnsino: string[] = [];
  protected selectedTpLocalizacao: string[] = [];

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
        this.selectedMetrica = this.metricas[0]?.chave ?? null;
        this.redesEnsino = (painel.dadosFiltros.rede_ensino ?? []).map((rede) => String(rede));
        this.tpLocalizacoes = ['Urbana', 'Rural'];
        this.graficos = Object.entries(painel.graficos ?? {}).map(([chave, grafico]) => ({
          chave,
          titulo: grafico.titulo,
          tipo: grafico.tipo,
          plotly: grafico.plotly,
        }));

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
  }

  protected onMunicipioChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedMunicipios = Array.from(select.selectedOptions)
      .map((option) => option.value)
      .filter((value) => value.length > 0);
  }

  protected onMetricaChange(metrica: string): void {
    this.selectedMetrica = metrica;
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
      variaveis: this.selectedMetrica ? [this.selectedMetrica] : null,
      municipios: this.selectedMunicipios.length ? this.selectedMunicipios : null,
      rede_ensino: this.selectedRedeEnsino.length ? this.selectedRedeEnsino : null,
      tp_localizacao: this.selectedTpLocalizacao.length ? this.selectedTpLocalizacao : null,
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
        this.graficos = Object.entries(painel.graficos ?? {}).map(([chave, grafico]) => ({
          chave,
          titulo: grafico.titulo,
          tipo: grafico.tipo,
          plotly: grafico.plotly,
        }));

        this.cd.markForCheck();
      });
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

    if (shouldShowSchools) {
      const pontosValidos = pontos.filter(
        (ponto) => Number.isFinite(ponto.latitude) && Number.isFinite(ponto.longitude),
      );
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

        const nome = String(ponto.nome ?? 'Escola');
        marker.bindPopup(this.buildSchoolPopup(ponto, nome, municipio, score, cor), {
          maxWidth: 320,
        });

        marker.addTo(this.schoolMarkersLayer);
      }
    }

    const bounds = this.schoolMarkersLayer?.getBounds() ?? this.municipalitiesLayer.getBounds();
    if (bounds.isValid()) {
      this.map?.fitBounds(bounds, { padding: [16, 16] });
    }
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
    ponto: PontoPopupModel,
    nome: string,
    municipio: string,
    score: number,
    cor: string,
  ): string {
    const details: Array<[string, unknown]> = [
      ['Escola', nome],
      ['Município', municipio || 'Não informado'],
      ['Score', Number.isFinite(score) ? score.toFixed(2) : '0.00'],
      ['Classificação', ponto.classificacao ?? ponto.classificacao_acessibilidade ?? 'Inexistente'],
      ['Bairro', ponto.no_bairro ?? 'Não informado'],
      ['Dependência', ponto.no_tp_dependencia ?? 'Não informado'],
      ['Localização', ponto.no_tp_localizacao ?? 'Não informado'],
      ['Código', ponto.co_entidade ?? 'Não informado'],
    ];

    const extraEntries = Object.entries(ponto as Record<string, unknown>).filter(([key, value]) => {
      if (value == null) return false;
      return ![
        'nome',
        'municipio',
        'latitude',
        'longitude',
        'score',
        'classificacao',
        'co_entidade',
        'no_entidade',
        'no_municipio',
        'no_bairro',
        'no_tp_dependencia',
        'no_tp_localizacao',
        'score_acessibilidade',
        'classificacao_acessibilidade',
      ].includes(key);
    });

    const escapeHtml = (value: unknown): string =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const rows = [
      ...details,
      ...extraEntries.map(([key, value]) => [key, value] as [string, unknown]),
    ]
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
      .map(
        ([label, value]) =>
          `<tr><th style="text-align:left;padding:2px 8px 2px 0;vertical-align:top;">${escapeHtml(label)}</th><td style="padding:2px 0;">${escapeHtml(value)}</td></tr>`,
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
