import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ColaboradoresHero } from '../../components/colaboradores-hero/colaboradores-hero';
import { ColaboradoresLista } from '../../components/colaboradores-lista/colaboradores-lista';
import { AreaColaboradores, Colaborador } from '../../models/colaboradores.models';

import membrosList from '../../mocks/membros.json';

@Component({
  selector: 'app-colaboradores-page',
  standalone: true,
  imports: [ColaboradoresHero, ColaboradoresLista],
  templateUrl: './colaboradores-page.component.html',
  styleUrl: './colaboradores-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradoresPageComponent {
  protected readonly orientador: Colaborador = {
    nome: 'Prof. Dr. Victor Hugo Santiago Costa Pinto',
    funcao: 'Coordenador do desenvolvimento do projeto',
    instituicao: 'Universidade Federal do Pará',
    grupo: 'Orientador',
  };

  protected readonly areasColaboradores: AreaColaboradores[] = this.agruparMembros();

  private agruparMembros(): AreaColaboradores[] {
    const descricoesTime: Record<string, string> = {
      'Qualidade/Testes':
        'Validação funcional, testes automatizados e garantia de qualidade da solução.',
      Dados: 'Tratamento, organização, análise e visualização de indicadores educacionais.',
      'Backend e APIs': 'Implementação de serviços, APIs e integrações da plataforma.',
      'Requisitos, UX e Validação':
        'Levantamento, análise, prototipação e validação das necessidades do projeto.',
      'Frontend, Mapas e Dashboards':
        'Desenvolvimento da interface visual, mapas iterativos e dashboards.',
    };

    const agrupado = membrosList.membros.reduce(
      (acc, membro) => {
        acc[membro.time] ??= [];
        acc[membro.time].push({ ...membro, grupo: membro.time });
        return acc;
      },
      {} as Record<string, Colaborador[]>,
    );

    return Object.entries(agrupado).map(([area, colaboradores]) => ({
      area,
      descricao: descricoesTime[area] || '',
      colaboradores,
    }));
  }
}
