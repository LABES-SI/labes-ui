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

import { ConectividadeFacade } from '../../../facades/conectividade.facade';
import {
  ClassificacaoConectividadeModel,
  MapaPontoModel,
} from '../../../models/conectividade.models';

interface MetricaCardModel {
  chave: string;
  label: string;
  tipo: 'flag' | 'quantidade';
}

const METRICAS: MetricaCardModel[] = [
  { chave: 'in_internet', label: 'Internet', tipo: 'flag' },
  { chave: 'in_internet_alunos', label: 'Internet para alunos', tipo: 'flag' },
  { chave: 'in_internet_administrativo', label: 'Internet administrativo', tipo: 'flag' },
  { chave: 'in_internet_aprendizagem', label: 'Internet para aprendizagem', tipo: 'flag' },
  { chave: 'in_internet_comunidade', label: 'Internet para a comunidade', tipo: 'flag' },
  { chave: 'in_banda_larga', label: 'Banda larga', tipo: 'flag' },
  {
    chave: 'in_acesso_internet_computador',
    label: 'Acesso à internet via computador',
    tipo: 'flag',
  },
  {
    chave: 'in_aces_internet_disp_pessoais',
    label: 'Acesso à internet via dispositivos pessoais',
    tipo: 'flag',
  },
  { chave: 'in_computador', label: 'Computador', tipo: 'flag' },
  { chave: 'in_desktop_aluno', label: 'Desktop para alunos', tipo: 'flag' },
  { chave: 'in_comp_portatil_aluno', label: 'Computador portátil para alunos', tipo: 'flag' },
  { chave: 'in_tablet_aluno', label: 'Tablet para alunos', tipo: 'flag' },
  { chave: 'in_redes_sociais', label: 'Redes sociais', tipo: 'flag' },
  { chave: 'qt_desktop_aluno', label: 'Quantidade de desktops', tipo: 'quantidade' },
  { chave: 'qt_comp_portatil_aluno', label: 'Quantidade de notebooks', tipo: 'quantidade' },
  { chave: 'qt_tablet_aluno', label: 'Quantidade de tablets', tipo: 'quantidade' },
];

const TP_REDE_LOCAL: Record<number, string> = {
  0: 'Não há rede local interligando computadores',
  1: 'A cabo',
  2: 'Wireless',
  3: 'A cabo e Wireless',
  9: 'Não informado',
};

const SCORE_INTERVALO: Record<ClassificacaoConectividadeModel, string> = {
  Excelente: '13-16',
  Boa: '9-12',
  Média: '5-8',
  Baixa: '1-4',
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
  private readonly facade = inject(ConectividadeFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly metricas = METRICAS;
  protected escola: MapaPontoModel | null = null;
  protected isLoading = true;
  protected naoEncontrada = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.facade
      .listarFiltros()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filtros) => {
        const anos = Array.from(
          new Set((filtros.anos ?? []).map((a) => Number(a)).filter((a) => Number.isFinite(a))),
        ).sort((a, b) => b - a);
        const ultimoAno = anos.length > 0 ? anos[0] : null;

        this.facade
          .listarMapa({ ano: ultimoAno })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((mapa) => {
            this.escola = (mapa.pontos ?? []).find((p) => Number(p.co_entidade) === id) ?? null;
            this.naoEncontrada = !this.escola;
            this.isLoading = false;
            this.cd.markForCheck();
          });
      });
  }

  protected scoreIntervaloLabel(classificacao: ClassificacaoConectividadeModel | string): string {
    return SCORE_INTERVALO[classificacao as ClassificacaoConectividadeModel] ?? '—';
  }

  protected formatarContagem(valor: unknown): string {
    if (valor === null || valor === undefined) return 'Sem informação';
    const numero = Number(valor);
    return Number.isFinite(numero) ? String(numero) : 'Sem informação';
  }

  protected formatarTpRedeLocal(valor: unknown): string {
    if (valor === null || valor === undefined) return 'Sem informação';
    const numero = Number(valor);
    return TP_REDE_LOCAL[numero] ?? 'Sem informação';
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
