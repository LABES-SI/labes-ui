import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AcessibilidadeFacade } from '../../../facades/acessibilidade.facade';
import {
  ClassificacaoAcessibilidadeModel,
  MapaPontoModel,
} from '../../../models/acessibilidade.models';

interface MetricaCardModel {
  chave: string;
  label: string;
  tipo: 'flag' | 'quantidade';
}

const METRICAS: MetricaCardModel[] = [
  { chave: 'in_acessibilidade_rampas', label: 'Rampas de acesso', tipo: 'flag' },
  { chave: 'in_acessibilidade_corrimao', label: 'Corrimão', tipo: 'flag' },
  { chave: 'in_acessibilidade_elevador', label: 'Elevador', tipo: 'flag' },
  { chave: 'in_acessibilidade_pisos_tateis', label: 'Pisos táteis', tipo: 'flag' },
  { chave: 'in_acessibilidade_vao_livre', label: 'Vão livre', tipo: 'flag' },
  { chave: 'in_acessibilidade_sinal_tatil', label: 'Sinalização tátil', tipo: 'flag' },
  { chave: 'in_acessibilidade_sinal_sonoro', label: 'Sinalização sonora', tipo: 'flag' },
  { chave: 'in_acessibilidade_sinal_visual', label: 'Sinalização visual', tipo: 'flag' },
  { chave: 'in_acessibilidade_inexistente', label: 'Outros tipos de acessibilidade', tipo: 'flag' },
  { chave: 'in_sala_atendimento_especial', label: 'Sala de atendimento especial', tipo: 'flag' },
  { chave: 'in_reserva_pcd', label: 'Reserva de vagas PCD', tipo: 'flag' },
  { chave: 'tp_aee', label: 'Atendimento educacional especializado', tipo: 'flag' },
  { chave: 'qt_salas_utilizadas_acessiveis', label: 'Salas acessíveis', tipo: 'quantidade' },
  { chave: 'qt_prof_psicologo', label: 'Profissionais de psicologia', tipo: 'quantidade' },
  {
    chave: 'qt_prof_assist_social',
    label: 'Profissionais de assistência social',
    tipo: 'quantidade',
  },
];

const SCORE_INTERVALO: Record<ClassificacaoAcessibilidadeModel, string> = {
  Excelente: '12-15',
  Boa: '8-11',
  Média: '4-7',
  Baixa: '1-3',
  Inexistente: '0',
};

@Component({
  selector: 'app-escola-detalhe-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './escola-detalhe-page.component.html',
  styleUrl: './escola-detalhe-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EscolaDetalhePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(AcessibilidadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly metricas = METRICAS;
  protected escola: MapaPontoModel | null = null;
  protected isLoading = true;
  protected naoEncontrada = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const anoParam = Number(this.route.snapshot.queryParamMap.get('ano'));
    const anoSelecionado = Number.isFinite(anoParam) && anoParam > 0 ? anoParam : null;

    this.facade
      .listarFiltros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filtros) => {
        const anos = Array.from(
          new Set((filtros.anos ?? []).map((a) => Number(a)).filter((a) => Number.isFinite(a))),
        ).sort((a, b) => b - a);
        const ultimoAno = anos.length > 0 ? anos[0] : null;
        const ano = anoSelecionado ?? ultimoAno;

        this.facade
          .listarMapa({ ano })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((mapa) => {
            this.escola = (mapa.pontos ?? []).find((p) => Number(p.co_entidade) === id) ?? null;
            this.naoEncontrada = !this.escola;
            this.isLoading = false;
            this.cd.markForCheck();
          });
      });
  }

  protected scoreIntervaloLabel(classificacao: ClassificacaoAcessibilidadeModel | string): string {
    return SCORE_INTERVALO[classificacao as ClassificacaoAcessibilidadeModel] ?? '—';
  }

  protected formatarIdeb(valor: unknown): string {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return 'Sem informação';
    return numero === 0 ? 'Sem informação' : numero.toFixed(1);
  }

  protected formatarContagem(valor: unknown): string {
    if (valor === null || valor === undefined) return 'Sem informação';
    const numero = Number(valor);
    return Number.isFinite(numero) ? String(numero) : 'Sem informação';
  }

  protected ativaMetrica(m: MetricaCardModel): boolean {
    const valor = Number(this.escola?.[m.chave]);
    return Number.isFinite(valor) && valor > 0;
  }

  protected valorExibidoMetrica(m: MetricaCardModel): string {
    if (m.tipo === 'quantidade') {
      const valor = Number(this.escola?.[m.chave]);
      return Number.isFinite(valor) ? String(valor) : '0';
    }
    return this.ativaMetrica(m) ? 'Sim' : 'Não';
  }
}
