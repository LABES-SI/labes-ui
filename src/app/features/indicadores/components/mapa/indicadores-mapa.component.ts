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

export const LEGENDA_PADRAO: LegendaItemModel[] = [
  { label: 'Boa', range: '8–11', classe: 'legend-dot--alta' },
  { label: 'Média', range: '5–7', classe: 'legend-dot--media' },
  { label: 'Baixa', range: '1–4', classe: 'legend-dot--baixa' },
  { label: 'Inexistente', range: '0', classe: 'legend-dot--muito-baixa' },
];

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
  readonly legendaItems = input<LegendaItemModel[]>(LEGENDA_PADRAO);
  readonly buildPopupHtml = input<((ponto: MapaPontoBaseModel) => string) | undefined>(undefined);
  readonly ariaLabel = input('Mapa de indicadores educacionais');

  readonly pontoSelecionado = output<MapaPontoBaseModel>();

  private map?: L.Map;
  private municipalitiesLayer?: L.GeoJSON;
  private schoolMarkersLayer?: L.FeatureGroup;
  private schoolMarkersById = new Map<number, L.Marker>();
  private mapReady = false;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: L.latLng(-3.5, -52.5),
      zoom: 6,
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
              '',
          ) || 'Inexistente';

        layer.bindTooltip(
          `${nome}<br>Score médio: ${score}<br>Classificação: ${classificacao}<br>Escolas: ${escolas}`,
          { sticky: true },
        );
      },
    }).addTo(this.map);

    if (this.mostrarMarcadores() && this.pontos().length > 0) {
      const pontosValidos = this.pontos().filter(
        (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
      );

      const scorePorMunicipio = new Map<string, { min: number; max: number }>();
      for (const p of pontosValidos) {
        const mun = String(p.municipio ?? '');
        const s = Number(p.score);
        if (!mun || !Number.isFinite(s)) continue;
        const atual = scorePorMunicipio.get(mun) ?? { min: s, max: s };
        atual.min = Math.min(atual.min, s);
        atual.max = Math.max(atual.max, s);
        scorePorMunicipio.set(mun, atual);
      }

      this.schoolMarkersLayer = L.featureGroup().addTo(this.map);

      for (const ponto of pontosValidos) {
        const faixas = scorePorMunicipio.get(String(ponto.municipio ?? ''));
        const cor = this.getScoreColor(Number(ponto.score), faixas?.min, faixas?.max);
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

    const score = Number(ponto.score);
    const cor = this.getScoreColor(score, score, score);
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
        </table>
      </div>
    `;
  }

  private getScoreColor(score: number, minScore?: number, maxScore?: number): string {
    if (!Number.isFinite(score)) return '#94a3b8';
    const min = minScore ?? score;
    const max = maxScore ?? score;
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return '#16a34a';
    const progress = Math.max(0, Math.min(1, (score - min) / (max - min)));
    return `hsl(${Math.round(120 * progress)}, 75%, 45%)`;
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
