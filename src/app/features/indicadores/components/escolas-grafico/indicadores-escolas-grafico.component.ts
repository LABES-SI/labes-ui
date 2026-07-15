import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotlyComponent } from 'angular-plotly.js';

import type { Paginacao } from '../../../../core/api/models/paginacao';
import { GraficoModel } from '../../models/indicadores.models';

@Component({
  selector: 'app-indicadores-escolas-grafico',
  standalone: true,
  imports: [CommonModule, PlotlyComponent],
  templateUrl: './indicadores-escolas-grafico.component.html',
  styleUrl: './indicadores-escolas-grafico.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresEscolasGraficoComponent {
  readonly grafico = input<GraficoModel | null>(null);
  readonly paginacao = input<Paginacao | null>(null);
  readonly carregando = input(false);

  readonly pageChange = output<number>();

  protected readonly paginaAtual = computed(() => (this.paginacao()?.page ?? 0) + 1);
  protected readonly totalPaginas = computed(() => this.paginacao()?.total_paginas ?? 0);
  protected readonly temAnterior = computed(() => (this.paginacao()?.page ?? 0) > 0);
  protected readonly temProxima = computed(() => this.paginaAtual() < this.totalPaginas());

  protected irParaPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas()) return;
    this.pageChange.emit(page);
  }

  protected anterior(): void {
    this.irParaPagina((this.paginacao()?.page ?? 0) - 1);
  }

  protected proxima(): void {
    this.irParaPagina((this.paginacao()?.page ?? 0) + 1);
  }
}
