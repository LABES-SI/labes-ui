import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppInputComponent } from '../../../../shared/ui/input/app-input.component';
import * as L from 'leaflet';
import { ConectividadeFacade } from '../../facades/conectividade.facade';
import { ConectividadeFiltersComponent } from '../../components/filters/conectividade-filters.component';
import { ConectividadeChartsComponent, GraficoApresentacao } from '../../components/charts/conectividade-charts.component';
import { MetricaFiltroModel, MunicipioFiltroModel, MapaPontoModel, MapaMunicipioGeoJsonCollectionModel } from '../../models/conectividade.models';
import { PlotlyFigure } from '../../../../core/api/models/plotly-figure';

@Component({
  selector: 'app-conectividade-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    AppInputComponent,
    ConectividadeFiltersComponent,
    ConectividadeChartsComponent
  ],
  templateUrl: './conectividade-page.component.html',
  styleUrl: './conectividade-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConectividadePageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  private readonly facade = inject(ConectividadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);
  private map?: L.Map;
  private municipalitiesLayer?: L.GeoJSON;
  private schoolMarkersLayer?: L.FeatureGroup;
  private schoolMarkersById = new Map<number, L.Marker>();

  // Filtros Disponíveis
  anos: number[] = [];
  municipios: MunicipioFiltroModel[] = [];
  metricas: MetricaFiltroModel[] = [];
  redesEnsino: string[] = [];
  tpLocalizacoes: string[] = [];
  situacaoConectividade: string[] = [];

  // Filtros Selecionados
  selectedAno: number | null = null;
  selectedMunicipios: string[] = [];
  selectedMetricas: string[] = [];
  selectedRedeEnsino: string[] = [];
  selectedTpLocalizacao: string[] = [];
  selectedSituacaoConectividade: string[] = [];

  // Dados para componentes
  graficosAnaliseTemporal: GraficoApresentacao[] = [];
  graficos: GraficoApresentacao[] = [];
  mapaCollection?: MapaMunicipioGeoJsonCollectionModel;
  escolasPontos: MapaPontoModel[] = [];

  // Busca
  searchTerm: string = '';
  searchResults: MapaPontoModel[] = [];
  searchPage = 1;
  readonly searchPageSize = 5;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: L.latLng(-3.5, -52.5),
      zoom: 6,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map!);
  }

  ngOnInit(): void {
    this.carregarFiltrosIniciais();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  carregarFiltrosIniciais(): void {
    this.facade
      .listarPainel()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.anos = (painel.dadosFiltros.anos ?? []).sort((a, b) => b - a);
        this.municipios = painel.dadosFiltros.municipios ?? [];
        this.metricas = painel.dadosFiltros.metricas ?? [];
        this.redesEnsino = painel.dadosFiltros.rede_ensino ?? [];
        this.tpLocalizacoes = painel.dadosFiltros.tp_localizacao ?? [];
        this.situacaoConectividade = painel.dadosFiltros.situacao_conectividade ?? [];

        if (this.anos.length > 0) {
          this.selectedAno = this.anos[0];
        }

        this.aplicarFiltros();
      });
  }

  onFilterChange(): void {
  }

  aplicarFiltros(): void {
    const params = this.buildParams();
    this.loadResumo(params);
    this.loadMapAndTable(params);
    this.loadAnaliseTemporal(params);
  }

  resetFiltros(): void {
    this.selectedAno = this.anos.length > 0 ? this.anos[0] : null;
    this.selectedMunicipios = [];
    this.selectedMetricas = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
    this.selectedSituacaoConectividade = [];
    this.aplicarFiltros();
  }

  buscarEscola(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    if (termo.length === 0) {
      this.searchResults = [];
      this.searchPage = 1;
      this.cd.markForCheck();
      return;
    }

    this.searchResults = this.escolasPontos.filter((escola) =>
      String(escola.nome || '')
        .toLowerCase()
        .includes(termo),
    );
    this.searchPage = 1;
    this.cd.markForCheck();
  }

  get paginatedSearchResults(): MapaPontoModel[] {
    const start = (this.searchPage - 1) * this.searchPageSize;
    return this.searchResults.slice(start, start + this.searchPageSize);
  }

  get totalSearchPages(): number {
    return Math.max(Math.ceil(this.searchResults.length / this.searchPageSize), 1);
  }

  get searchPageNumbers(): number[] {
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

  setSearchPage(page: number): void {
    this.searchPage = Math.min(Math.max(page, 1), this.totalSearchPages);
    this.cd.markForCheck();
  }

  scoreBadgeClass(escola: MapaPontoModel): string {
    const classificacao = String(escola.classificacao || '').toLowerCase();

    if (
      classificacao.includes('conectada') &&
      !classificacao.includes('parcial') &&
      !classificacao.includes('sem')
    ) {
      return 'score-badge--alta';
    }
    if (classificacao.includes('parcial')) {
      return 'score-badge--media';
    }
    if (classificacao.includes('sem conectividade') || classificacao.includes('inexistente')) {
      return 'score-badge--muito-baixa';
    }

    return 'score-badge--baixa';
  }

  onRowClick(escola: MapaPontoModel): void {
    if (!this.map || !Number.isFinite(escola.latitude) || !Number.isFinite(escola.longitude)) {
      this.cd.markForCheck();
      return;
    }
    
    this.map.setView([escola.latitude, escola.longitude], 15);
    const marker = this.getOrCreateSchoolMarker(escola);
    if (marker) {
      marker.openPopup();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cd.markForCheck();
  }

  fecharPopups(): void {
    for (const marker of this.schoolMarkersById.values()) {
      marker.closePopup();
    }
    this.cd.markForCheck();
  }

  private buildParams(): any {
    return {
      ano: this.selectedAno,
      variaveis: this.selectedMetricas.length ? this.selectedMetricas : null,
      municipios: this.selectedMunicipios.length ? this.selectedMunicipios : null,
      rede_ensino: this.selectedRedeEnsino.length ? this.selectedRedeEnsino : null,
      tp_localizacao: this.selectedTpLocalizacao.length ? this.selectedTpLocalizacao : null,
      situacao_conectividade: this.selectedSituacaoConectividade.length
        ? this.selectedSituacaoConectividade
        : null,
    };
  }

  private loadResumo(params: any): void {
    this.facade
      .listarPainel(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.graficos = this.mapGraficosPainel(painel.graficos ?? {});
        this.cd.markForCheck();
      });
  }

  private loadMapAndTable(params: any): void {
    this.facade.listarMapaMunicipalGeoJsonComPontos(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.mapaCollection = data.collection;
      this.escolasPontos = data.pontos || [];
      
      if (!this.map) return;

      if (this.municipalitiesLayer) {
        this.municipalitiesLayer.removeFrom(this.map);
      }
      if (this.schoolMarkersLayer) {
        this.schoolMarkersLayer.removeFrom(this.map);
      }

      this.schoolMarkersById.clear();
      
      this.municipalitiesLayer = L.geoJSON(this.mapaCollection as Parameters<typeof L.geoJSON>[0], {
        style: (feature) => ({
          color: '#4a6fa5',
          weight: 1,
          fillColor: (feature?.properties as { cor?: string })?.cor ?? '#cccccc',
          fillOpacity: 0.55,
        }),
      }).addTo(this.map);

      this.schoolMarkersLayer = L.featureGroup().addTo(this.map);

      for (const escola of this.escolasPontos) {
        if (Number.isFinite(escola.latitude) && Number.isFinite(escola.longitude)) {
          this.getOrCreateSchoolMarker(escola);
        }
      }

      this.cd.markForCheck();
    });
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
      Situação: ${classificacao}
    `;

    const marker = L.marker([escola.latitude, escola.longitude])
      .bindPopup(popup)
      .addTo(this.schoolMarkersLayer);

    this.schoolMarkersById.set(escola.co_entidade, marker);
    return marker;
  }

  private loadAnaliseTemporal(params: any): void {
    const analiseParams = {
      metrica: this.selectedMetricas.length ? this.selectedMetricas[0] : null,
    };
    this.facade
      .listarAnaliseTemporal(analiseParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((analise) => {
        this.graficosAnaliseTemporal = (analise.listaGraficos ?? []).map((g) => ({
          chave: g.chave,
          titulo: g.titulo,
          tipo: g.tipo,
          plotly: this.normalizarGraficoPlotly(g.plotly),
        }));
        this.cd.markForCheck();
      });
  }

  private mapGraficosPainel(graficos: Record<string, any>): GraficoApresentacao[] {
    return Object.entries(graficos).map(([chave, grafico]) => ({
      chave,
      titulo: grafico.titulo,
      tipo: grafico.tipo,
      plotly: this.normalizarGraficoPlotly(grafico.plotly),
    }));
  }

  private normalizarGraficoPlotly(figure: PlotlyFigure): PlotlyFigure {
    const layout = { ...(figure?.layout ?? {}) };
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
        },
      },
    };
  }
}
