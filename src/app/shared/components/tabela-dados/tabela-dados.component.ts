import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface TabelaDadosColuna {
  chave: string;
  titulo: string;
}

@Component({
  selector: 'app-tabela-dados',
  standalone: true,
  templateUrl: './tabela-dados.component.html',
  styleUrl: './tabela-dados.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabelaDadosComponent {
  readonly colunas = input.required<readonly TabelaDadosColuna[]>();
  readonly linhas = input.required<readonly object[]>();

  protected valorCelula(linha: object, chave: string): unknown {
    return (linha as Record<string, unknown>)[chave];
  }
}
