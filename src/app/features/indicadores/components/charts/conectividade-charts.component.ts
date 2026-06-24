import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyComponent, PlotlyService } from 'angular-plotly.js';
import { GraficoCardComponent } from '../../../../shared/components/grafico-card/grafico-card.component';
import { PlotlyFigure } from '../../../../core/api/models/plotly-figure';

PlotlyService.setPlotly(PlotlyJS);

export type GraficoApresentacao = {
  chave: string;
  titulo: string;
  tipo: string;
  plotly: PlotlyFigure;
};

@Component({
  selector: 'app-conectividade-charts',
  standalone: true,
  imports: [CommonModule, PlotlyComponent, GraficoCardComponent],
  templateUrl: './conectividade-charts.component.html',
  styleUrl: './conectividade-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConectividadeChartsComponent {
  @Input() graficosAnaliseTemporal: GraficoApresentacao[] = [];
  @Input() graficos: GraficoApresentacao[] = [];
}
