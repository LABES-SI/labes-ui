import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetricaFiltroModel, MunicipioFiltroModel } from '../../models/conectividade.models';

@Component({
  selector: 'app-conectividade-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conectividade-filters.component.html',
  styleUrl: './conectividade-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConectividadeFiltersComponent {
  @Input() anos: number[] = [];
  @Input() municipios: MunicipioFiltroModel[] = [];
  @Input() metricas: MetricaFiltroModel[] = [];
  @Input() redesEnsino: string[] = [];
  @Input() tpLocalizacoes: string[] = [];
  @Input() situacaoConectividade: string[] = [];

  @Input() selectedAno: number | null = null;
  @Input() selectedMunicipios: string[] = [];
  @Input() selectedMetricas: string[] = [];
  @Input() selectedRedeEnsino: string[] = [];
  @Input() selectedTpLocalizacao: string[] = [];
  @Input() selectedSituacaoConectividade: string[] = [];

  @Output() selectedAnoChange = new EventEmitter<number | null>();
  @Output() selectedMunicipiosChange = new EventEmitter<string[]>();
  @Output() selectedMetricasChange = new EventEmitter<string[]>();
  @Output() selectedRedeEnsinoChange = new EventEmitter<string[]>();
  @Output() selectedTpLocalizacaoChange = new EventEmitter<string[]>();
  @Output() selectedSituacaoConectividadeChange = new EventEmitter<string[]>();

  @Output() filterChange = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onAnoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAno = val ? Number(val) : null;
    this.selectedAnoChange.emit(this.selectedAno);
    this.filterChange.emit();
  }

  toggleValue(values: string[], value: string, type: string): void {
    const index = values.indexOf(value);
    if (index >= 0) {
      values.splice(index, 1);
    } else {
      values.push(value);
    }
    this.emitChange(type, values);
    this.filterChange.emit();
  }

  removeValue(values: string[], value: string, event: Event, type: string): void {
    event.preventDefault();
    event.stopPropagation();
    const index = values.indexOf(value);
    if (index >= 0) {
      values.splice(index, 1);
    }
    this.emitChange(type, values);
    this.filterChange.emit();
  }

  private emitChange(type: string, values: string[]): void {
    switch (type) {
      case 'municipios':
        this.selectedMunicipiosChange.emit([...values]);
        break;
      case 'metricas':
        this.selectedMetricasChange.emit([...values]);
        break;
      case 'rede':
        this.selectedRedeEnsinoChange.emit([...values]);
        break;
      case 'localizacao':
        this.selectedTpLocalizacaoChange.emit([...values]);
        break;
      case 'situacao':
        this.selectedSituacaoConectividadeChange.emit([...values]);
        break;
    }
  }

  visibleValues(values: string[], limit: number): string[] {
    return values.slice(0, limit);
  }

  hiddenCount(values: string[], visibleLimit: number): number {
    return Math.max(values.length - visibleLimit, 0);
  }

  visibleMetricLabels(limit: number): MetricaFiltroModel[] {
    const metricasByKey = new Map(this.metricas.map((m) => [m.chave, m]));
    return this.selectedMetricas.slice(0, limit).map((chave) => ({
      chave,
      label: metricasByKey.get(chave)?.label ?? chave,
    }));
  }
}
