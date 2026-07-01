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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AcessibilidadeFacade } from '../../../facades/acessibilidade.facade';
import { AppToastService } from '../../../../../shared/ui/toast/app-toast.service';
import { PlotlyFigure } from '../../../../../core/api/models/plotly-figure';
import {
  ClassificacaoAcessibilidadeModel,
  MapaPontoModel,
} from '../../../models/acessibilidade.models';
import { AppInputComponent } from '../../../../../shared/ui/input/app-input.component';
import { IndicadoresFiltersComponent } from '../../../components/filters/indicadores-filters.component';
import {
  IndicadoresMapaComponent,
  LEGENDA_ACESSIBILIDADE,
} from '../../../components/mapa/indicadores-mapa.component';
import {
  IndicadoresChartsComponent,
  GraficoApresentacao,
} from '../../../components/charts/indicadores-charts.component';
import {
  MapaPontoBaseModel,
  LegendaItemModel,
  GeoJsonFeatureCollectionModel,
} from '../../../models/indicadores.models';

type MetricaFiltroModel = { chave: string; label: string };
type MunicipioFiltroModel = { codigo: number; nome: string };

const SCORE_INTERVALO: Record<ClassificacaoAcessibilidadeModel, string> = {
  Excelente: '12-15',
  Boa: '8-11',
  Média: '4-7',
  Baixa: '1-3',
  Inexistente: '0',
};

@Component({
  selector: 'app-visao-geral-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppInputComponent,
    IndicadoresFiltersComponent,
    IndicadoresMapaComponent,
    IndicadoresChartsComponent,
  ],
  templateUrl: './visao-geral-page.component.html',
  styleUrl: './visao-geral-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisaoGeralPageComponent implements OnInit {
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

  protected selectedAno: number | null = null;
  protected selectedMunicipios: string[] = [];
  protected selectedMetricas: string[] = [];
  protected selectedRedeEnsino: string[] = [];
  protected selectedTpLocalizacao: string[] = [];
  protected selectedPibid: boolean | null = null;

  protected isLoading = true;
  protected isLoadingFilters = false;

  protected allSchools: MapaPontoModel[] = [];
  protected geoCollection: GeoJsonFeatureCollectionModel | null = null;
  protected mostrarMarcadores = false;
  protected readonly legendaItems: LegendaItemModel[] = LEGENDA_ACESSIBILIDADE;

  protected searchTerm = '';
  protected selectedSchools: MapaPontoModel[] = [];

  protected get suggestions(): MapaPontoModel[] {
    const termo = this.searchTerm.trim().toLowerCase();
    if (!termo) return [];
    const selecionadas = new Set(this.selectedSchools.map((e) => e.co_entidade));
    return this.allSchools
      .filter(
        (e) =>
          !selecionadas.has(e.co_entidade) &&
          String(e.nome ?? '')
            .toLowerCase()
            .includes(termo),
      )
      .slice(0, 8);
  }

  protected get pontosExibidos(): MapaPontoModel[] {
    return this.selectedSchools.length > 0 ? this.selectedSchools : this.allSchools;
  }

  protected get mostrarMarcadoresEfetivo(): boolean {
    return this.selectedSchools.length > 0 || this.mostrarMarcadores;
  }

  protected onSearchChange(term: string | null): void {
    this.searchTerm = term ?? '';
    if (!this.searchTerm.trim() && this.selectedSchools.length > 0) {
      this.selectedSchools = [];
      this.mapaComponent?.resetarVisualizacao();
    }
  }

  protected selecionarEscola(escola: MapaPontoModel): void {
    if (!this.selectedSchools.some((e) => e.co_entidade === escola.co_entidade)) {
      this.selectedSchools = [...this.selectedSchools, escola];
    }
    this.searchTerm = '';
  }

  protected removerEscolaSelecionada(escola: MapaPontoModel): void {
    this.selectedSchools = this.selectedSchools.filter((e) => e.co_entidade !== escola.co_entidade);
    if (this.selectedSchools.length === 0) {
      this.mapaComponent?.resetarVisualizacao();
    }
  }

  private agendarResetVisualizacao(): void {
    setTimeout(() => this.mapaComponent?.resetarVisualizacao(), 0);
  }

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
      ['IDEB Anos Iniciais', this.formatarValorIdeb(escola.ideb_2023_anos_iniciais)],
      ['IDEB Anos Finais', this.formatarValorIdeb(escola.ideb_2023_anos_finais)],
      ['IDEB Ensino Médio', this.formatarValorIdeb(escola.ideb_2023_ensino_medio)],
      ['PIBID', this.formatarValorContagem(escola.pibid)],
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

  private formatarValorIdeb(valor: unknown): string | null {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return null;
    return numero === 0 ? 'Sem informação' : numero.toFixed(1);
  }

  private formatarValorContagem(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return 'Sem informação';
    return String(valor);
  }

  protected scoreIntervaloLabel(classificacao: ClassificacaoAcessibilidadeModel | string): string {
    return SCORE_INTERVALO[classificacao as ClassificacaoAcessibilidadeModel] ?? '—';
  }

  ngOnInit(): void {
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
        this.selectedAno = this.anos.length > 0 ? this.anos[0] : null;
        this.isLoading = false;
        const params = this.buildParams();
        this.loadPainel(params);
        this.loadMapa(params);
        this.cd.markForCheck();
      });
  }

  protected aplicarFiltros(userAction = false): void {
    this.showToastOnComplete = userAction;
    const params = this.buildParams();
    this.loadPainel(params);
    this.loadMapa(params);
  }

  protected onGraficosLayoutChange(): void {
    this.loadPainel(this.buildParams());
  }

  protected resetFiltros(): void {
    this.selectedMetricas = [];
    this.selectedMunicipios = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
    this.selectedPibid = null;
    this.selectedAno = this.anos.length > 0 ? this.anos[0] : null;
    this.searchTerm = '';
    this.selectedSchools = [];
    this.cd.markForCheck();
    const params = this.buildParams();
    this.loadPainel(params);
    this.loadMapa(params, true);
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
        this.onLoadEnd();
      });
  }

  private loadMapa(params?: ReturnType<typeof this.buildParams>, resetView = false): void {
    this.onLoadStart();
    this.facade
      .listarMapaMunicipalGeoJsonComPontos(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ collection, pontos }) => {
        this.geoCollection = collection as unknown as GeoJsonFeatureCollectionModel;
        this.allSchools = pontos.filter(
          (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
        );
        this.mostrarMarcadores = (params?.municipios?.length ?? 0) > 0;
        this.onLoadEnd();
        if (resetView) {
          this.agendarResetVisualizacao();
        }
      });
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
