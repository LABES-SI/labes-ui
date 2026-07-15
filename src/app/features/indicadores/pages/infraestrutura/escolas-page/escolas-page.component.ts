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
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InfraestruturaFacade } from '../../../facades/infraestrutura.facade';
import { AppToastService } from '../../../../../shared/ui/toast/app-toast.service';
import {
  ClassificacaoInfraestruturaModel,
  MapaPontoModel,
} from '../../../models/infraestrutura.models';
import { AppInputComponent } from '../../../../../shared/ui/input/app-input.component';
import { IndicadoresFiltersComponent } from '../../../components/filters/indicadores-filters.component';

type MetricaFiltroModel = { chave: string; label: string };
type MunicipioFiltroModel = { codigo: number; nome: string };

const SCORE_INTERVALO: Record<ClassificacaoInfraestruturaModel, string> = {
  Boa: '12-17',
  Média: '7-11',
  Baixa: '1-6',
  Inexistente: '0',
};

@Component({
  selector: 'app-escolas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppInputComponent, IndicadoresFiltersComponent],
  templateUrl: './escolas-page.component.html',
  styleUrl: './escolas-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EscolasPageComponent implements OnInit {
  private readonly facade = inject(InfraestruturaFacade);
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

  protected selectedAno: number | null = null;
  protected selectedMunicipios: string[] = [];
  protected selectedMetricas: string[] = [];
  protected selectedRedeEnsino: string[] = [];
  protected selectedTpLocalizacao: string[] = [];
  protected selectedPibid: boolean | null = null;

  protected isLoading = true;
  protected isLoadingFilters = false;

  protected searchTerm = '';
  protected searchResults: MapaPontoModel[] = [];
  protected searchPage = 1;
  protected readonly searchPageSize = 8;
  private readonly searchSubject = new Subject<string>();

  protected selectedClassificacoes: string[] = [];
  protected readonly classificacoesDisponiveis: ClassificacaoInfraestruturaModel[] = [
    'Boa',
    'Média',
    'Baixa',
    'Inexistente',
  ];

  protected sortBy: 'nome' | 'score-desc' | 'score-asc' = 'nome';

  protected allSchools: MapaPontoModel[] = [];

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
        this.selectedAno = this.anos.length > 0 ? this.anos[0] : null;
        this.isLoading = false;
        this.loadEscolas(this.buildParams());
        this.cd.markForCheck();
      });
  }

  protected aplicarFiltros(userAction = false): void {
    this.showToastOnComplete = userAction;
    this.loadEscolas(this.buildParams());
  }

  protected resetFiltros(): void {
    this.selectedMetricas = [];
    this.selectedMunicipios = [];
    this.selectedRedeEnsino = [];
    this.selectedTpLocalizacao = [];
    this.selectedPibid = null;
    this.selectedClassificacoes = [];
    this.sortBy = 'nome';
    this.selectedAno = this.anos.length > 0 ? this.anos[0] : null;
    this.cd.markForCheck();
    this.aplicarFiltros();
  }

  protected onSearchChange(term: string | null): void {
    this.searchTerm = term ?? '';
    this.searchSubject.next(this.searchTerm);
  }

  protected buscarEscola(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    let resultado = this.allSchools;

    if (termo) {
      resultado = resultado.filter((e) =>
        String(e.nome ?? '')
          .toLowerCase()
          .includes(termo),
      );
    }
    if (this.selectedClassificacoes.length > 0) {
      resultado = resultado.filter((e) =>
        this.selectedClassificacoes.includes(String(e.classificacao ?? '')),
      );
    }

    this.searchResults = this.ordenarEscolas(resultado);
    this.searchPage = 1;
    this.cd.markForCheck();
  }

  protected toggleClassificacaoEBuscar(classificacao: string): void {
    this.selectedClassificacoes = this.selectedClassificacoes.includes(classificacao)
      ? []
      : [classificacao];
    this.buscarEscola();
  }

  protected setSortBy(sortBy: 'nome' | 'score-desc' | 'score-asc'): void {
    this.sortBy = sortBy;
    this.buscarEscola();
  }

  private ordenarEscolas(escolas: MapaPontoModel[]): MapaPontoModel[] {
    const ordenado = [...escolas];
    switch (this.sortBy) {
      case 'score-desc':
        return ordenado.sort((a, b) => Number(b.score) - Number(a.score));
      case 'score-asc':
        return ordenado.sort((a, b) => Number(a.score) - Number(b.score));
      default:
        return ordenado.sort((a, b) =>
          String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'pt-BR'),
        );
    }
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
    const half = 2;
    const start = Math.min(Math.max(this.searchPage - half, 1), Math.max(total - 4, 1));
    const end = Math.min(start + 4, total);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  protected setSearchPage(page: number): void {
    this.searchPage = Math.min(Math.max(page, 1), this.totalSearchPages);
    this.cd.markForCheck();
  }

  protected scoreIntervaloLabel(classificacao: ClassificacaoInfraestruturaModel | string): string {
    return SCORE_INTERVALO[classificacao as ClassificacaoInfraestruturaModel] ?? '—';
  }

  protected scoreBadgeClass(escola: MapaPontoModel): string {
    const classificacao = String(escola.classificacao ?? '').toLowerCase();
    const score = Number(escola.score);
    if (classificacao.includes('boa') || score >= 9) return 'score-badge--alta';
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

  private loadEscolas(params?: ReturnType<typeof this.buildParams>): void {
    this.onLoadStart();
    this.facade
      .listarMapa(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mapa) => {
        this.allSchools = mapa.pontos ?? [];
        this.buscarEscola();
        this.onLoadEnd();
      });
  }
}
