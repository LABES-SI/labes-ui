import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AcessibilidadeFacade } from '../../../facades/acessibilidade.facade';
import { AppToastService } from '../../../../../shared/ui/toast/app-toast.service';
import { PlotlyFigure } from '../../../../../core/api/models/plotly-figure';
import {
  IndicadoresChartsComponent,
  GraficoApresentacao,
} from '../../../components/charts/indicadores-charts.component';

type MetricaFiltroModel = { chave: string; label: string };

const METRICA_PADRAO = 'in_acessibilidade_rampas';

@Component({
  selector: 'app-analise-temporal-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IndicadoresChartsComponent],
  templateUrl: './analise-temporal-page.component.html',
  styleUrl: './analise-temporal-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnaliseTemporalPageComponent implements OnInit {
  private readonly facade = inject(AcessibilidadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly toast = inject(AppToastService);

  private pendingRequests = 0;
  private showToastOnComplete = false;

  protected metricas: MetricaFiltroModel[] = [];
  protected graficosAnaliseTemporal: GraficoApresentacao[] = [];

  protected selectedMetrica: string | null = METRICA_PADRAO;
  protected selectedPibid: boolean | null = null;

  protected isLoading = true;
  protected isLoadingFilters = false;

  ngOnInit(): void {
    this.facade
      .listarFiltros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filtros) => {
        this.metricas = (filtros.metricas ?? []).map((m) => ({
          chave: String(m.chave),
          label: String(m.label),
        }));
        this.isLoading = false;
        this.loadAnaliseTemporal();
        this.cd.markForCheck();
      });
  }

  protected aplicarFiltros(userAction = false): void {
    this.showToastOnComplete = userAction;
    this.loadAnaliseTemporal();
  }

  protected resetFiltros(): void {
    this.selectedMetrica = METRICA_PADRAO;
    this.selectedPibid = null;
    this.cd.markForCheck();
    this.aplicarFiltros();
  }

  protected onGraficosLayoutChange(): void {
    this.loadAnaliseTemporal();
  }

  protected onPibidChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPibid = checked ? true : null;
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

  private loadAnaliseTemporal(): void {
    this.onLoadStart();
    this.facade
      .listarAnaliseTemporal({ metrica: this.selectedMetrica, pibid: this.selectedPibid })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((analise) => {
        this.graficosAnaliseTemporal = analise.listaGraficos.map((g) => ({
          chave: g.chave,
          titulo: g.titulo,
          tipo: g.tipo,
          plotly: this.normalizarPlotly(g.plotly),
        }));
        this.onLoadEnd();
      });
  }

  private normalizarPlotly(figure: PlotlyFigure): PlotlyFigure {
    const layout = { ...(figure.layout ?? {}) };
    const originalMargin = (layout['margin'] ?? {}) as Record<string, unknown>;
    const hasIndicator = (figure.data ?? []).some((t) => t['type'] === 'indicator');
    const originalTopMargin = Number(originalMargin['t'] ?? 24);
    delete layout['title'];
    delete layout['margin'];
    delete layout['height'];
    delete layout['width'];
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
