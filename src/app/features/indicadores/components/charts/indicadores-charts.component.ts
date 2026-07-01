import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyComponent, PlotlyService } from 'angular-plotly.js';
import { LayoutGrid, List, LucideAngularModule } from 'lucide-angular';

import { GraficoApresentacao } from '../../models/indicadores.models';

PlotlyService.setPlotly(PlotlyJS);

export type { GraficoApresentacao };

@Component({
  selector: 'app-indicadores-charts',
  standalone: true,
  imports: [CommonModule, PlotlyComponent, LucideAngularModule],
  templateUrl: './indicadores-charts.component.html',
  styleUrl: './indicadores-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresChartsComponent {
  readonly graficosAnaliseTemporal = input<GraficoApresentacao[]>([]);
  readonly graficos = input<GraficoApresentacao[]>([]);
  readonly graficosLayout = input<'acordeao' | 'grade'>('acordeao');

  readonly layoutChange = output<1 | 2>();

  protected readonly layoutGridIcon = LayoutGrid;
  protected readonly listIcon = List;
  protected readonly colunas = signal<1 | 2>(2);

  protected setColunas(colunas: 1 | 2): void {
    if (this.colunas() === colunas) return;
    this.colunas.set(colunas);
    this.layoutChange.emit(colunas);
  }
}
