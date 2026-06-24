import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MetricaFiltroModel, MunicipioFiltroModel } from '../../models/indicadores.models';

@Component({
  selector: 'app-indicadores-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './indicadores-filters.component.html',
  styleUrl: './indicadores-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresFiltersComponent {
  readonly anos = input<number[]>([]);
  readonly municipios = input<MunicipioFiltroModel[]>([]);
  readonly metricas = input<MetricaFiltroModel[]>([]);
  readonly redesEnsino = input<string[]>([]);
  readonly tpLocalizacoes = input<string[]>([]);

  readonly selectedAno = model<number | null>(null);
  readonly selectedMunicipios = model<string[]>([]);
  readonly selectedMetricas = model<string[]>([]);
  readonly selectedRedeEnsino = model<string[]>([]);
  readonly selectedTpLocalizacao = model<string[]>([]);
  readonly selectedPibid = model<boolean | null>(null);

  readonly isLoading = input(false);

  readonly apply = output<void>();
  readonly resetar = output<void>();

  onPibidChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedPibid.set(checked ? true : null);
  }

  onAnoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAno.set(val ? Number(val) : null);
  }

  toggleValue(values: string[], value: string, type: string): void {
    const arr = [...values];
    const index = arr.indexOf(value);
    if (index >= 0) {
      arr.splice(index, 1);
    } else {
      arr.push(value);
    }
    this.emitChange(type, arr);
  }

  removeValue(values: string[], value: string, event: Event, type: string): void {
    event.preventDefault();
    event.stopPropagation();
    const arr = [...values];
    const index = arr.indexOf(value);
    if (index >= 0) {
      arr.splice(index, 1);
    }
    this.emitChange(type, arr);
  }

  visibleValues(values: string[], limit: number): string[] {
    return values.slice(0, limit);
  }

  hiddenCount(values: string[], visibleLimit: number): number {
    return Math.max(values.length - visibleLimit, 0);
  }

  visibleMetricLabels(limit: number): MetricaFiltroModel[] {
    const metricasByKey = new Map(this.metricas().map((m) => [m.chave, m]));
    return this.selectedMetricas()
      .slice(0, limit)
      .map((chave) => ({ chave, label: metricasByKey.get(chave)?.label ?? chave }));
  }

  private emitChange(type: string, values: string[]): void {
    switch (type) {
      case 'municipios':
        this.selectedMunicipios.set(values);
        break;
      case 'metricas':
        this.selectedMetricas.set(values);
        break;
      case 'rede':
        this.selectedRedeEnsino.set(values);
        break;
      case 'localizacao':
        this.selectedTpLocalizacao.set(values);
        break;
    }
  }
}
