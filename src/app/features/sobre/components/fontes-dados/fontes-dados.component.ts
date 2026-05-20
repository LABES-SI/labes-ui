import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-fontes-dados',
  standalone: true,
  imports: [],
  templateUrl: './fontes-dados.component.html',
  styleUrl: './fontes-dados.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FontesDadosComponent {
  fontes = [
    {
      titulo: 'Censo Escolar',
      descricao:
        'Levantamento anual de dados sobre escolas, matrículas, turmas, docentes, infraestrutura e gestão escolar em todas as redes de ensino do país.',
    },
    {
      titulo: 'PIBID',
      descricao:
        'Programa Institucional de Bolsa de Iniciação à Docência, com informações de apoio à formação de professores e iniciativas de fortalecimento da educação básica.',
    },
  ];
}
