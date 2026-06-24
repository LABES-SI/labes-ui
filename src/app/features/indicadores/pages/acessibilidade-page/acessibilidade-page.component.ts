import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AcessibilidadeFacade } from '../../facades/acessibilidade.facade';
import { AppToastService } from '../../../../shared/ui/toast/app-toast.service';
import { PlotlyFigure } from '../../../../core/api/models/plotly-figure';
import {
  ClassificacaoAcessibilidadeModel,
  MapaPontoModel,
} from '../../models/acessibilidade.models';
import { AppInputComponent } from '../../../../shared/ui/input/app-input.component';
import { IndicadoresFiltersComponent } from '../../components/filters/indicadores-filters.component';
import {
  IndicadoresMapaComponent,
  LEGENDA_PADRAO,
} from '../../components/mapa/indicadores-mapa.component';
import {
  IndicadoresChartsComponent,
  GraficoApresentacao,
} from '../../components/charts/indicadores-charts.component';
import {
  MapaPontoBaseModel,
  LegendaItemModel,
  GeoJsonFeatureCollectionModel,
} from '../../models/indicadores.models';

type MetricaFiltroModel = { chave: string; label: string };
type MunicipioFiltroModel = { codigo: number; nome: string };

const SCORE_INTERVALO: Record<ClassificacaoAcessibilidadeModel, string> = {
  Boa: '8–11',
  Média: '5–7',
  Baixa: '1–4',
  Inexistente: '0',
};

@Component({
  selector: 'app-acessibilidade-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppInputComponent,
    IndicadoresFiltersComponent,
    IndicadoresMapaComponent,
    IndicadoresChartsComponent,
  ],
  templateUrl: './acessibilidade-page.component.html',
  styleUrl: './acessibilidade-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcessibilidadePageComponent implements OnInit {
  @ViewChild(IndicadoresMapaComponent) private mapaComponent?: IndicadoresMapaComponent;

  private readonly facade = inject(AcessibilidadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly toast = inject(AppToastService);

  private pendingRequests = 0;
  private showToastOnComplete = false;

  protected anos: number[] = [];
  protected municipios: MunicipioFiltroModel[] = [];
  protected metricas: MetricaFiltroModel[] = [];
  protected redesEnsino: string[] = [];
  protected tpLocalizacoes: string[] = [];
  protected graficos: GraficoApresentacao[] = [];
  protected graficosAnaliseTemporal: GraficoApresentacao[] = [];

  protected selectedAno: number | null = 2024;
  protected selectedMunicipios: string[] = [];
  protected selectedMetricas: string[] = [];
  protected selectedRedeEnsino: string[] = [];
  protected selectedTpLocalizacao: string[] = [];
  protected selectedPibid: boolean | null = null;

  protected isLoading = true;
  protected isLoadingFilters = false;
  protected painelDescricao = '';

  protected searchTerm = '';
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
  private _rankingEscolas: MapaPontoModel[] = [];

  protected allSchools: MapaPontoModel[] = [];
  protected geoCollection: GeoJsonFeatureCollectionModel | null = null;
  protected mostrarMarcadores = false;
  protected readonly legendaItems: LegendaItemModel[] = LEGENDA_PADRAO;

  protected buildPopupHtml = (ponto: MapaPontoBaseModel): string => {
    const escola = ponto as unknown as MapaPontoModel;
    const score = Number(escola.score);
    const classificacao = String(
      escola.classificacao ?? escola['classificacao_acessibilidade'] ?? 'Inexistente',
    );
    const intervalo = this.scoreIntervaloLabel(classificacao);
    const nome = String(escola.nome ?? 'Escola');
    const municipio = String(escola.municipio ?? 'Não informado');

    const details: Array<[string, unknown]> = [
      ['Escola', nome],
      ['Município', municipio],
      ['Bairro', escola.no_bairro ?? 'Não informado'],
      ['Score', `${Number.isFinite(score) ? score.toFixed(2) : '0.00'} (faixa: ${intervalo})`],
      ['Classificação', classificacao],
      ['Rede', escola.no_tp_dependencia ?? 'Não informado'],
      ['Localização', escola.no_tp_localizacao ?? 'Não informado'],
      ['Código', escola.co_entidade ?? 'Não informado'],
    ];

    const esc = (v: unknown) =>
      String(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const rows = details
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(
        ([label, v]) =>
          `<tr><th style="text-align:left;padding:2px 8px 2px 0;vertical-align:top;white-space:nowrap;">${esc(label)}</th><td>${esc(v)}</td></tr>`,
      )
      .join('');

    return `<div style="min-width:240px;"><strong>${esc(nome)}</strong><br><table style="width:100%;border-collapse:collapse;font-size:12px;line-height:1.35;margin-top:6px;">${rows}</table></div>`;
  };

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscarEscola());

    this.facade
      .listarFiltros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filtros) => {
        this.anos = Array.from(
          new Set((filtros.anos ?? []).map((a) => Number(a)).filter((a) => Number.isFinite(a))),
        ).sort((a, b) => b - a);
        this.municipios = (filtros.municipios ?? []).map((m) => ({
          codigo: Number(m.codigo),
          nome: String(m.nome),
        }));
        this.metricas = (filtros.metricas ?? []).map((m) => ({
          chave: String(m.chave),
          label: String(m.label),
        }));
        this.redesEnsino = (filtros.rede_ensino ?? []).map(String);
        this.tpLocalizacoes = (filtros.tp_localizacao ?? []).map(String);
        this.isLoading = false;
        this.loadMapa(this.buildParams());
        this.loadAnaliseTemporal({
          metrica: this.getMetricaAnaliseTemporal(),
          pibid: this.selectedPibid,
        });
        this.cd.markForCheck();
      });

    this.facade
      .listarPainel(this.buildParams())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.graficos = this.mapGraficos(painel.graficos ?? {});
        this.painelDescricao = painel.descricao ?? '';
        this.cd.markForCheck();
      });
  }

  protected aplicarFiltros(userAction = false): void {
    this.showToastOnComplete = userAction;
    const params = this.buildParams();
    this.loadPainel(params);
    this.loadMapa(params);
    this.loadAnaliseTemporal({
      metrica: this.getMetricaAnaliseTemporal(),
      pibid: this.selectedPibid,
    });
  }

  protected resetFiltros(): void {
    this.selectedMetricas = [];
    this.selectedMunicipios = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
    this.selectedPibid = null;
    this.selectedClassificacoes = [];
    this.selectedAno = 2024;
    this.cd.markForCheck();
    this.aplicarFiltros();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  protected buscarEscola(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    const temFiltroClassificacao = this.selectedClassificacoes.length > 0;

    if (!termo && !temFiltroClassificacao) {
      this.searchResults = [];
      this.searchPage = 1;
      this.cd.markForCheck();
      return;
    }

    let resultado = this.allSchools;
    if (termo) {
      resultado = resultado.filter((e) =>
        String(e.nome ?? '')
          .toLowerCase()
          .includes(termo),
      );
    }
    if (temFiltroClassificacao) {
      resultado = resultado.filter((e) =>
        this.selectedClassificacoes.includes(String(e.classificacao ?? '')),
      );
    }

    this.searchResults = resultado;
    this.searchPage = 1;
    this.cd.markForCheck();
  }

  protected toggleClassificacaoEBuscar(classificacao: string): void {
    const index = this.selectedClassificacoes.indexOf(classificacao);
    if (index >= 0) this.selectedClassificacoes.splice(index, 1);
    else this.selectedClassificacoes.push(classificacao);
    this.buscarEscola();
  }

  protected mostrarEscola(escola: MapaPontoModel): void {
    this.mapaComponent?.focarPonto(escola as unknown as MapaPontoBaseModel);
  }

  protected get paginatedSearchResults(): MapaPontoModel[] {
    const start = (this.searchPage - 1) * this.searchPageSize;
    return this.searchResults.slice(start, start + this.searchPageSize);
  }

  protected get totalSearchPages(): number {
    return Math.max(Math.ceil(this.searchResults.length / this.searchPageSize), 1);
  }

  protected get searchPageNumbers(): number[] {
    const total = this.totalSearchPages;
    const half = 1;
    const start = Math.min(Math.max(this.searchPage - half, 1), Math.max(total - 2, 1));
    const end = Math.min(start + 2, total);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
    const total = this.rankingTotalPages;
    const half = 2;
    const start = Math.min(Math.max(this.rankingPage - half, 1), Math.max(total - 4, 1));
    const end = Math.min(start + 4, total);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
    if (classificacao.includes('boa') || score >= 8) return 'score-badge--alta';
    if (classificacao.includes('média') || classificacao.includes('media') || score >= 5)
      return 'score-badge--media';
    if (classificacao.includes('baixa') || score > 0) return 'score-badge--baixa';
    return 'score-badge--muito-baixa';
  }

  private buildParams() {
    return {
      ano: this.selectedAno ?? null,
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

  private loadPainel(params?: ReturnType<typeof this.buildParams>): void {
    this.onLoadStart();
    this.facade
      .listarPainel(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((painel) => {
        this.graficos = this.mapGraficos(painel.graficos ?? {});
        this.painelDescricao = painel.descricao ?? '';
        this.onLoadEnd();
      });
  }

  private loadMapa(params?: ReturnType<typeof this.buildParams>): void {
    this.onLoadStart();
    this.facade
      .listarMapaMunicipalGeoJsonComPontos(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ collection, pontos }) => {
        this.geoCollection = collection as unknown as GeoJsonFeatureCollectionModel;
        const pontosValidos = pontos.filter(
          (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
        );
        this.allSchools = pontosValidos;
        this._rankingEscolas = [...pontosValidos].sort((a, b) => Number(b.score) - Number(a.score));
        this.rankingPage = 1;
        this.mostrarMarcadores = (params?.municipios?.length ?? 0) > 0;
        this.onLoadEnd();
      });
  }

  private loadAnaliseTemporal(params?: { metrica?: string | null; pibid?: boolean | null }): void {
    this.onLoadStart();
    this.facade
      .listarAnaliseTemporal(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((analise) => {
        this.graficosAnaliseTemporal = analise.listaGraficos.map((g) => ({
          chave: g.chave,
          titulo: g.titulo,
          tipo: g.tipo,
          plotly: g.plotly,
        }));
        this.onLoadEnd();
      });
  }

  private getMetricaAnaliseTemporal(): string | null {
    return this.selectedMetricas[0] ?? null;
  }

  private mapGraficos(
    graficos: Record<string, { titulo: string; tipo: string; plotly: PlotlyFigure }>,
  ): GraficoApresentacao[] {
    return Object.entries(graficos).map(([chave, g]) => ({
      chave,
      titulo: g.titulo,
      tipo: g.tipo,
      plotly: this.normalizarPlotly(g.plotly),
    }));
  }

  private normalizarPlotly(figure: PlotlyFigure): PlotlyFigure {
    const layout = { ...(figure.layout ?? {}) };
    const originalMargin = (layout['margin'] ?? {}) as Record<string, unknown>;
    const hasIndicator = (figure.data ?? []).some((t) => t['type'] === 'indicator');
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
}
