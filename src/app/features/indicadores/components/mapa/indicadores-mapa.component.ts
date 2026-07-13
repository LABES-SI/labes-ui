import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

import {
  GeoJsonFeatureCollectionModel,
  LegendaItemModel,
  MapaPontoBaseModel,
} from '../../models/indicadores.models';

export const LEGENDA_ACESSIBILIDADE: LegendaItemModel[] = [
  { label: 'Excelente', range: '12-15', classe: 'legend-dot--alta' },
  { label: 'Boa', range: '8-11', classe: 'legend-dot--alta' },
  { label: 'Média', range: '4-7', classe: 'legend-dot--media' },
  { label: 'Baixa', range: '1-3', classe: 'legend-dot--baixa' },
  { label: 'Inexistente', range: '0', classe: 'legend-dot--muito-baixa' },
];

export const LEGENDA_CONECTIVIDADE: LegendaItemModel[] = [
  { label: 'Excelente', range: '13-16', classe: 'legend-dot--alta' },
  { label: 'Boa', range: '9-12', classe: 'legend-dot--alta' },
  { label: 'Média', range: '5-8', classe: 'legend-dot--media' },
  { label: 'Baixa', range: '1-4', classe: 'legend-dot--baixa' },
  { label: 'Inexistente', range: '0', classe: 'legend-dot--muito-baixa' },
];

export const LEGENDA_INFRAESTRUTURA: LegendaItemModel[] = [
  { label: 'Boa', range: '12-17', classe: 'legend-dot--alta' },
  { label: 'Média', range: '7-11', classe: 'legend-dot--media' },
  { label: 'Baixa', range: '1-6', classe: 'legend-dot--baixa' },
  { label: 'Inexistente', range: '0', classe: 'legend-dot--muito-baixa' },
];

export const LEGENDA_PADRAO: LegendaItemModel[] = LEGENDA_ACESSIBILIDADE;

const DEFAULT_CENTER = L.latLng(-3.5, -52.5);
const DEFAULT_ZOOM = 6;

const CLASSE_CORES: Record<string, string> = {
  'legend-dot--muito-alta': '#059669',
  'legend-dot--alta': '#22c55e',
  'legend-dot--media': '#f59e0b',
  'legend-dot--baixa': '#f97316',
  'legend-dot--muito-baixa': '#dc2626',
};

@Component({
  selector: 'app-indicadores-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './indicadores-mapa.component.html',
  styleUrl: './indicadores-mapa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresMapaComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  readonly pontos = input<MapaPontoBaseModel[]>([]);
  readonly geoCollection = input<GeoJsonFeatureCollectionModel | null>(null);
  readonly mostrarMarcadores = input(false);
  readonly legendaTipo = input<'acessibilidade' | 'conectividade' | 'infraestrutura'>(
    'acessibilidade',
  );
  readonly legendaItems = input<LegendaItemModel[] | null>(null);
  readonly buildPopupHtml = input<((ponto: MapaPontoBaseModel) => string) | undefined>(undefined);
  readonly ariaLabel = input('Mapa de indicadores educacionais');

  readonly pontoSelecionado = output<MapaPontoBaseModel>();

  private map?: L.Map;
  private municipalitiesLayer?: L.GeoJSON;
  private schoolMarkersLayer?: L.FeatureGroup;
  private schoolMarkersById = new Map<number, L.Marker>();
  private mapReady = false;

  protected get legendaExibida(): LegendaItemModel[] {
    const legendas = this.legendaItems();
    if (legendas?.length) {
      return legendas;
    }

    switch (this.legendaTipo()) {
      case 'conectividade':
        return LEGENDA_CONECTIVIDADE;
      case 'infraestrutura':
        return LEGENDA_INFRAESTRUTURA;
      default:
        return LEGENDA_ACESSIBILIDADE;
    }
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.mapReady = true;

    if (this.geoCollection()) {
      this.updateLayers();
    }
  }

  ngOnChanges(): void {
    if (this.mapReady) {
      this.updateLayers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  focarPonto(ponto: MapaPontoBaseModel): void {
    if (!this.map || !Number.isFinite(ponto.latitude) || !Number.isFinite(ponto.longitude)) return;

    this.map.setView([ponto.latitude, ponto.longitude], 15);
    const marker = this.getOrCreateMarker(ponto);
    marker?.openPopup();
  }

  fecharPopups(): void {
    for (const marker of this.schoolMarkersById.values()) {
      marker.closePopup();
    }
  }

  resetarVisualizacao(): void {
    if (!this.map) return;

    this.schoolMarkersLayer?.remove();
    this.schoolMarkersLayer = undefined;
    for (const marker of this.schoolMarkersById.values()) marker.remove();
    this.schoolMarkersById.clear();

    const bounds = this.municipalitiesLayer?.getBounds();
    if (bounds?.isValid()) {
      this.map.fitBounds(bounds, { padding: [16, 16] });
    } else {
      this.map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }

  private updateLayers(): void {
    const geo = this.geoCollection();
    if (!this.map || !geo) return;

    this.municipalitiesLayer?.remove();
    this.schoolMarkersLayer?.remove();
    for (const marker of this.schoolMarkersById.values()) marker.remove();
    this.schoolMarkersById.clear();

    this.municipalitiesLayer = L.geoJSON(geo as Parameters<typeof L.geoJSON>[0], {
      style: (feature) => {
        const cor = String(feature?.properties?.['cor'] ?? '#94a3b8');
        return { color: cor, fillColor: cor, weight: 1, opacity: 1, fillOpacity: 0.65 };
      },
      onEachFeature: (feature, layer) => {
        const nome = String(feature.properties?.['NM_MUN'] ?? 'Município');
        const score = Number(feature.properties?.['media_score'] ?? 0).toFixed(2);
        const escolas = Number(feature.properties?.['quantidade_escolas'] ?? 0);
        const classificacao =
          String(
            feature.properties?.['classificacao_acessibilidade_municipio'] ??
              feature.properties?.['classificacao_conectividade_municipio'] ??
              feature.properties?.['classificacao_infraestrutura_municipio'] ??
              '',
          ) || 'Inexistente';

        const idebMun = this.formatarLinhasIdeb(
          feature.properties?.['ideb_2023_anos_iniciais_mun'],
          feature.properties?.['ideb_2023_anos_finais_mun'],
          feature.properties?.['ideb_2023_ensino_medio_mun'],
        );
        const pibidTotal = feature.properties?.['pibid_total'];
        const pibidLinha =
          pibidTotal !== undefined
            ? `<br>PIBID: ${this.formatarValorContagem(pibidTotal as number | null)}`
            : '';

        layer.bindTooltip(
          `${nome}<br>Score médio: ${score}<br>Classificação: ${classificacao}<br>Escolas: ${escolas}${idebMun}${pibidLinha}`,
          { sticky: true },
        );
      },
    }).addTo(this.map);

    if (this.mostrarMarcadores() && this.pontos().length > 0) {
      const pontosValidos = this.pontos().filter(
        (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
      );

      this.schoolMarkersLayer = L.featureGroup().addTo(this.map);

      for (const ponto of pontosValidos) {
        const cor = this.getClassificacaoColor(ponto);
        const marker = L.marker([ponto.latitude, ponto.longitude], {
          icon: this.createPinIcon(cor),
        });

        marker.bindPopup(this.buildPopup(ponto, cor), {
          autoClose: false,
          closeOnClick: false,
          maxWidth: 320,
        });

        marker.on('click', () => this.pontoSelecionado.emit(ponto));
        this.schoolMarkersById.set(Number(ponto.co_entidade), marker);
        marker.addTo(this.schoolMarkersLayer);
      }
    }

    const bounds = this.schoolMarkersLayer?.getBounds().isValid()
      ? this.schoolMarkersLayer.getBounds()
      : this.municipalitiesLayer.getBounds();

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [16, 16] });
    }
  }

  private getOrCreateMarker(ponto: MapaPontoBaseModel): L.Marker | null {
    const id = Number(ponto.co_entidade);
    const existente = this.schoolMarkersById.get(id);
    if (existente) return existente;

    if (!this.map) return null;

    const cor = this.getClassificacaoColor(ponto);
    const marker = L.marker([ponto.latitude, ponto.longitude], {
      icon: this.createPinIcon(cor),
    });

    marker.bindPopup(this.buildPopup(ponto, cor), {
      autoClose: false,
      closeOnClick: false,
      maxWidth: 320,
    });

    this.schoolMarkersById.set(id, marker);
    (this.schoolMarkersLayer ?? this.map).addLayer(marker);

    return marker;
  }

  private buildPopup(ponto: MapaPontoBaseModel, cor: string): string {
    const popupFn = this.buildPopupHtml();
    if (popupFn) {
      return popupFn(ponto);
    }

    const escape = (v: unknown) =>
      String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const score = Number(ponto.score);
    const nome = escape(ponto.nome ?? 'Escola');
    const municipio = escape(ponto.municipio ?? 'Não informado');
    const classificacao = escape(ponto.classificacao ?? 'Inexistente');
    const scoreStr = Number.isFinite(score) ? score.toFixed(2) : '0.00';
    const idebRows = this.buildIdebRows(
      ponto['ideb_2023_anos_iniciais'],
      ponto['ideb_2023_anos_finais'],
      ponto['ideb_2023_ensino_medio'],
    );
    const pibidRow = `<tr><th style="text-align:left;padding:2px 8px 2px 0;white-space:nowrap;">PIBID</th><td>${this.formatarValorContagem(ponto['pibid'] as number | null | undefined)}</td></tr>`;

    return `
      <div style="min-width:200px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${escape(cor)};"></span>
          <strong>${nome}</strong>
        </div>
        <table style="font-size:12px;border-collapse:collapse;width:100%;">
          <tr><th style="text-align:left;padding:2px 8px 2px 0;white-space:nowrap;">Município</th><td>${municipio}</td></tr>
          <tr><th style="text-align:left;padding:2px 8px 2px 0;white-space:nowrap;">Score</th><td>${scoreStr}</td></tr>
          <tr><th style="text-align:left;padding:2px 8px 2px 0;white-space:nowrap;">Classificação</th><td>${classificacao}</td></tr>
          ${idebRows}
          ${pibidRow}
        </table>
      </div>
    `;
  }

  private getClassificacaoColor(ponto: MapaPontoBaseModel): string {
    const label = String(
      ponto.classificacao ??
        ponto['classificacao_acessibilidade'] ??
        ponto['classificacao_conectividade'] ??
        ponto['classificacao_infraestrutura'] ??
        '',
    );
    const item = this.legendaExibida.find((l) => l.label === label);
    const cor = item ? CLASSE_CORES[item.classe] : undefined;
    return cor ?? '#94a3b8';
  }

  private formatarValorIdeb(valor: unknown): string | null {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return null;
    return numero === 0 ? 'Sem informação' : numero.toFixed(1);
  }

  private formatarValorContagem(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return 'Sem informação';
    return String(valor);
  }

  private buildIdebRows(anosIniciais: unknown, anosFinais: unknown, ensinoMedio: unknown): string {
    const linhas: Array<[string, unknown]> = [
      ['IDEB Anos Iniciais', anosIniciais],
      ['IDEB Anos Finais', anosFinais],
      ['IDEB Ensino Médio', ensinoMedio],
    ];

    return linhas
      .map(([label, valor]): [string, string | null] => [label, this.formatarValorIdeb(valor)])
      .filter((item): item is [string, string] => item[1] !== null)
      .map(
        ([label, valorFormatado]) =>
          `<tr><th style="text-align:left;padding:2px 8px 2px 0;white-space:nowrap;">${label}</th><td>${valorFormatado}</td></tr>`,
      )
      .join('');
  }

  private formatarLinhasIdeb(
    anosIniciais: unknown,
    anosFinais: unknown,
    ensinoMedio: unknown,
  ): string {
    const linhas: Array<[string, unknown]> = [
      ['IDEB anos iniciais', anosIniciais],
      ['IDEB anos finais', anosFinais],
      ['IDEB ensino médio', ensinoMedio],
    ];

    return linhas
      .map(([label, valor]): [string, string | null] => [label, this.formatarValorIdeb(valor)])
      .filter((item): item is [string, string] => item[1] !== null)
      .map(([label, valorFormatado]) => `<br>${label}: ${valorFormatado}`)
      .join('');
  }

  private createPinIcon(color: string): L.Icon {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42"><path d="M14 41s10-13.2 10-23.8C24 8.4 19.5 3 14 3S4 8.4 4 17.2C4 27.8 14 41 14 41Z" fill="${color}" stroke="#1f2937" stroke-width="1.2"/><circle cx="14" cy="17" r="4.2" fill="#ffffff" fill-opacity="0.95"/></svg>`;
    return L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      iconSize: [28, 42],
      iconAnchor: [14, 41],
      popupAnchor: [0, -38],
    });
  }
}
