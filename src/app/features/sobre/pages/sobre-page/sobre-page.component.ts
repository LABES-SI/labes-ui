import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TituloSecaoComponent } from '../../../../shared/components/titulo-secao/titulo-secao.component';
import { FontesDadosComponent } from '../../components/fontes-dados/fontes-dados.component';
import { SobreFacade } from '../../facades/sobre.facade';

@Component({
  selector: 'app-sobre-page',
  standalone: true,
  imports: [TituloSecaoComponent, FontesDadosComponent],
  templateUrl: './sobre-page.component.html',
  styleUrl: './sobre-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SobrePageComponent {
  private readonly sobreFacade = inject(SobreFacade);

  protected readonly objetivos = toSignal(this.sobreFacade.listarObjetivos(), {
    initialValue: [],
  });
  protected readonly etapasFuncionamento = toSignal(this.sobreFacade.listarEtapasFuncionamento(), {
    initialValue: [],
  });
  protected readonly fontesDados = toSignal(this.sobreFacade.listarFontesDados(), {
    initialValue: [],
  });
  protected readonly equipe = toSignal(this.sobreFacade.listarEquipe(), {
    initialValue: [],
  });

  protected readonly totalFontesDados = computed(() => this.fontesDados().length);
}
