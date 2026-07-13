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

import { InfraestruturaFacade } from '../../../facades/infraestrutura.facade';
import {
  ClassificacaoInfraestruturaModel,
  MapaPontoModel,
} from '../../../models/infraestrutura.models';

interface MetricaCardModel {
  chave: string;
  label: string;
}

const METRICAS: MetricaCardModel[] = [
  { chave: 'in_agua_potavel', label: 'Água potável' },
  { chave: 'in_energia_rede_publica', label: 'Energia (rede pública)' },
  { chave: 'in_esgoto_rede_publica', label: 'Esgoto (rede pública)' },
  { chave: 'in_lixo_servico_coleta', label: 'Coleta de lixo' },
  { chave: 'in_banheiro', label: 'Banheiro' },
  { chave: 'in_banheiro_pne', label: 'Banheiro acessível (PNE)' },
  { chave: 'in_biblioteca', label: 'Biblioteca' },
  { chave: 'in_sala_leitura', label: 'Sala de leitura' },
  { chave: 'in_laboratorio_ciencias', label: 'Laboratório de ciências' },
  { chave: 'in_laboratorio_informatica', label: 'Laboratório de informática' },
  { chave: 'in_sala_multiuso', label: 'Sala multiuso' },
  { chave: 'in_sala_atendimento_especial', label: 'Sala de atendimento especial' },
  { chave: 'in_cozinha', label: 'Cozinha' },
  { chave: 'in_refeitorio', label: 'Refeitório' },
  { chave: 'in_quadra_esportes', label: 'Quadra de esportes' },
  { chave: 'in_patio_coberto', label: 'Pátio coberto' },
  { chave: 'in_auditorio', label: 'Auditório' },
];

const SCORE_INTERVALO: Record<ClassificacaoInfraestruturaModel, string> = {
  Boa: '12-17',
  Média: '7-11',
  Baixa: '1-6',
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
  private readonly facade = inject(InfraestruturaFacade);
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

  protected scoreIntervaloLabel(classificacao: ClassificacaoInfraestruturaModel | string): string {
    return SCORE_INTERVALO[classificacao as ClassificacaoInfraestruturaModel] ?? '—';
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
    return this.ativaMetrica(m) ? 'Sim' : 'Não';
  }
}
