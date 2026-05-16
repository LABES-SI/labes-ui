import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { GraficoCardComponent } from '../../../../shared/components/grafico-card/grafico-card.component';
import { IndicadorCardComponent } from '../../../../shared/components/indicador-card/indicador-card.component';
import { PainelFiltrosComponent } from '../../../../shared/components/painel-filtros/painel-filtros.component';
import {
  TabelaDadosColuna,
  TabelaDadosComponent,
} from '../../../../shared/components/tabela-dados/tabela-dados.component';
import { TituloSecaoComponent } from '../../../../shared/components/titulo-secao/titulo-secao.component';
import { InicioFacade } from '../../facades/inicio.facade';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [
    GraficoCardComponent,
    IndicadorCardComponent,
    PainelFiltrosComponent,
    TabelaDadosComponent,
    TituloSecaoComponent,
  ],
  templateUrl: './inicio-page.component.html',
  styleUrl: './inicio-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPageComponent {
  private readonly inicioFacade = inject(InicioFacade);

  protected readonly indicadores = toSignal(this.inicioFacade.listarIndicadoresResumo(), {
    initialValue: [],
  });
  protected readonly escolasDestaque = toSignal(this.inicioFacade.listarEscolasDestaque(), {
    initialValue: [],
  });
  protected readonly areasObservatorio = toSignal(this.inicioFacade.listarAreasObservatorio(), {
    initialValue: [],
  });

  protected readonly possuiIndicadores = computed(() => this.indicadores().length > 0);

  protected readonly escolasColunas: readonly TabelaDadosColuna[] = [
    { chave: 'nome', titulo: 'Escola' },
    { chave: 'municipio', titulo: 'Município' },
    { chave: 'indicador', titulo: 'Indicador' },
  ];

  protected onConsultarFiltros(): void {
    console.info('Consulta de filtros será integrada nas próximas entregas.');
  }
}
