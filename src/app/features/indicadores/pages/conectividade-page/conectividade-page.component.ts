import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppInputComponent } from '../../../../shared/ui/input/app-input.component';
import { ConectividadeFacade } from '../../facades/conectividade.facade';
import { IndicadoresFiltersComponent } from '../../components/filters/indicadores-filters.component';
import {
  IndicadoresChartsComponent,
  GraficoApresentacao,
} from '../../components/charts/indicadores-charts.component';
import {
  IndicadoresMapaComponent,
  LEGENDA_PADRAO,
} from '../../components/mapa/indicadores-mapa.component';
import {
  MetricaFiltroModel,
  MunicipioFiltroModel,
  MapaPontoModel,
  GraficoModel,
} from '../../models/conectividade.models';
import {
  MapaPontoBaseModel,
  LegendaItemModel,
  GeoJsonFeatureCollectionModel,
} from '../../models/indicadores.models';
import { PlotlyFigure } from '../../../../core/api/models/plotly-figure';
import { AppToastService } from '../../../../shared/ui/toast/app-toast.service';

@Component({
  selector: 'app-conectividade-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppInputComponent,
    IndicadoresFiltersComponent,
    IndicadoresMapaComponent,
    IndicadoresChartsComponent,
  ],
  templateUrl: './conectividade-page.component.html',
  styleUrl: './conectividade-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConectividadePageComponent implements OnInit {
  @ViewChild(IndicadoresMapaComponent) private mapaComponent?: IndicadoresMapaComponent;

  private readonly facade = inject(ConectividadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly toast = inject(AppToastService);

  private pendingRequests = 0;
  private showToastOnComplete = false;

  anos: number[] = [];
  municipios: MunicipioFiltroModel[] = [];
  metricas: MetricaFiltroModel[] = [];
  redesEnsino: string[] = [];
  tpLocalizacoes: string[] = [];

  selectedAno: number | null = null;
  selectedMunicipios: string[] = [];
  selectedMetricas: string[] = [];
  selectedRedeEnsino: string[] = [];
  selectedTpLocalizacao: string[] = [];
  selectedPibid: boolean | null = null;
  isLoading = true;
  isLoadingFilters = false;

  graficosAnaliseTemporal: GraficoApresentacao[] = [];
  graficos: GraficoApresentacao[] = [];
  geoCollection: GeoJsonFeatureCollectionModel | null = null;
  escolasPontos: MapaPontoModel[] = [];
  mostrarMarcadores = false;
  readonly legendaItems: LegendaItemModel[] = LEGENDA_PADRAO;

  searchTerm = '';
  searchResults: MapaPontoModel[] = [];
  searchPage = 1;
  readonly searchPageSize = 5;

  protected buildPopupHtml = (ponto: MapaPontoBaseModel): string => {
    const escola = ponto as unknown as MapaPontoModel;
    const score = Number(escola.score ?? 0).toFixed(1);
    const classificacao = String(escola.classificacao ?? '—');
    const esc = (v: unknown) =>
      String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<strong>${esc(escola.nome)}</strong><br>Município: ${esc(escola.municipio ?? '—')}<br>Score: ${score}<br>Situação: ${esc(classificacao)}`;
  };

  ngOnInit(): void {
    this.carregarFiltrosIniciais();
  }

  carregarFiltrosIniciais(): void {
    this.facade
      .listarFiltros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filtros) => {
        this.anos = (filtros.anos ?? []).sort((a, b) => b - a);
        this.municipios = filtros.municipios ?? [];
        this.metricas = filtros.metricas ?? [];
        this.redesEnsino = filtros.rede_ensino ?? [];
        this.tpLocalizacoes = filtros.tp_localizacao ?? [];

        if (this.anos.length > 0) {
          this.selectedAno = this.anos[0];
        }

        this.isLoading = false;
        this.cd.markForCheck();
        this.aplicarFiltros();
      });
  }

  aplicarFiltros(userAction = false): void {
    this.showToastOnComplete = userAction;
    const params = this.buildParams();
    this.loadResumo(params);
    this.loadMapa(params);
    this.loadAnaliseTemporal();
  }

  resetFiltros(): void {
    this.selectedAno = this.anos.length > 0 ? this.anos[0] : null;
    this.selectedMunicipios = [];
    this.selectedMetricas = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
    this.selectedPibid = null;
    this.aplicarFiltros();
  }

  buscarEscola(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    if (!termo) {
      this.searchResults = [];
      this.searchPage = 1;
      this.cd.markForCheck();
      return;
    }

    this.searchResults = this.escolasPontos.filter((escola) =>
      String(escola.nome ?? '')
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
    const total = this.totalSearchPages;
    const half = 1;
    const start = Math.min(Math.max(this.searchPage - half, 1), Math.max(total - 2, 1));
    const end = Math.min(start + 2, total);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  setSearchPage(page: number): void {
    this.searchPage = Math.min(Math.max(page, 1), this.totalSearchPages);
    this.cd.markForCheck();
  }

  scoreBadgeClass(escola: MapaPontoModel): string {
    const classificacao = String(escola.classificacao ?? '').toLowerCase();
    if (
      classificacao.includes('conectada') &&
      !classificacao.includes('parcial') &&
      !classificacao.includes('sem')
    ) {
      return 'score-badge--alta';
    }
    if (classificacao.includes('parcial')) return 'score-badge--media';
    if (classificacao.includes('sem conectividade') || classificacao.includes('inexistente')) {
      return 'score-badge--muito-baixa';
    }
    return 'score-badge--baixa';
  }

  onRowClick(escola: MapaPontoModel): void {
    this.mapaComponent?.focarPonto(escola as unknown as MapaPontoBaseModel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private buildParams() {
    return {
      ano: this.selectedAno,
      variaveis: this.selectedMetricas.length ? this.selectedMetricas : null,
      municipios: this.selectedMunicipios.length ? this.selectedMunicipios : null,
      rede_ensino: this.selectedRedeEnsino.length ? this.selectedRedeEnsino : null,
      tp_localizacao: this.selectedTpLocalizacao.length ? this.selectedTpLocalizacao : null,
      pibid: this.selectedPibid,
    };
  }

  private onLoadStart(): void {
    this.pendingRequests++;
    this.isLoadingFilters = true;
    this.cd.markForCheck();
  }

  private onLoadEnd(): void {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    if (this.pendingRequests === 0) {
      this.isLoadingFilters = false;
      if (this.showToastOnComplete) {
        this.toast.success('Filtros aplicados com sucesso');
        this.showToastOnComplete = false;
      }
      this.cd.markForCheck();
    }
  }

  private loadResumo(params: ReturnType<typeof this.buildParams>): void {
    this.onLoadStart();
    this.facade
      .listarPainel(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.graficos = this.mapGraficosPainel(painel.graficos ?? {});
        this.onLoadEnd();
      });
  }

  private loadMapa(params: ReturnType<typeof this.buildParams>): void {
    this.onLoadStart();
    this.facade
      .listarMapaMunicipalGeoJsonComPontos(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.geoCollection = data.collection as unknown as GeoJsonFeatureCollectionModel;
        this.escolasPontos = (data.pontos ?? []).filter(
          (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
        );
        this.mostrarMarcadores = (params.municipios?.length ?? 0) > 0;
        this.onLoadEnd();
      });
  }

  private loadAnaliseTemporal(): void {
    this.onLoadStart();
    this.facade
      .listarAnaliseTemporal({
        metrica: this.selectedMetricas.length ? this.selectedMetricas[0] : null,
        pibid: this.selectedPibid,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((analise) => {
        this.graficosAnaliseTemporal = (analise.listaGraficos ?? []).map((g) => ({
          chave: g.chave,
          titulo: g.titulo,
          tipo: g.tipo,
          plotly: this.normalizarGraficoPlotly(g.plotly),
        }));
        this.onLoadEnd();
      });
  }

  private mapGraficosPainel(graficos: Record<string, GraficoModel>): GraficoApresentacao[] {
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
