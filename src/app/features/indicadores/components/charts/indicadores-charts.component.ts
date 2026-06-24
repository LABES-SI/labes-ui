import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyComponent, PlotlyService } from 'angular-plotly.js';

import { GraficoApresentacao } from '../../models/indicadores.models';

PlotlyService.setPlotly(PlotlyJS);

export type { GraficoApresentacao };

@Component({
  selector: 'app-indicadores-charts',
  standalone: true,
  imports: [CommonModule, PlotlyComponent],
  templateUrl: './indicadores-charts.component.html',
  styleUrl: './indicadores-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresChartsComponent {
  @Input() graficosAnaliseTemporal: GraficoApresentacao[] = [];
  @Input() graficos: GraficoApresentacao[] = [];
}
