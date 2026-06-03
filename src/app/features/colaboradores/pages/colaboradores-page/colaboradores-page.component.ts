import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ColaboradoresHero } from '../../components/colaboradores-hero/colaboradores-hero';
import { ColaboradoresLista } from '../../components/colaboradores-lista/colaboradores-lista';
import { AreaColaboradores, Colaborador } from '../../models/colaboradores.models';

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

  protected readonly areasColaboradores: AreaColaboradores[] = [
    {
      area: 'Engenharia de Requisitos',
      descricao: 'Levantamento, análise e validação das necessidades do projeto.',
      colaboradores: [
        {
          nome: 'Ana Beatriz Souza',
          funcao: 'Analista de requisitos',
          instituicao: 'Universidade Federal do Pará',
          grupo: 'Requisitos',
        },
        {
          nome: 'Lucas Ferreira Lima',
          funcao: 'Pesquisador de domínio',
          instituicao: 'Parceiros acadêmicos',
          grupo: 'Requisitos',
        },
      ],
    },
    {
      area: 'Desenvolvimento de Software',
      descricao: 'Implementação da interface, serviços, APIs e integrações da plataforma.',
      colaboradores: [
        {
          nome: 'Marina Costa Alves',
          funcao: 'Desenvolvedora Angular',
          instituicao: 'LABES',
          grupo: 'Front-end',
        },
        {
          nome: 'Rafael Martins Rocha',
          funcao: 'Desenvolvedor front-end',
          instituicao: 'LABES',
          grupo: 'Front-end',
        },
        {
          nome: 'Camila Nogueira Reis',
          funcao: 'Desenvolvedora back-end',
          instituicao: 'LABES',
          grupo: 'Back-end',
        },
        {
          nome: 'João Pedro Almeida',
          funcao: 'Desenvolvedor de APIs',
          instituicao: 'Universidade Federal do Pará',
          grupo: 'Back-end',
        },
      ],
    },
    {
      area: 'Análise de Dados',
      descricao: 'Tratamento, organização, análise e visualização de indicadores educacionais.',
      colaboradores: [
        {
          nome: 'Fernanda Ribeiro Santos Martins de Carvalho',
          funcao: 'Analista de dados educacionais',
          instituicao: 'Universidade Federal do Pará',
          grupo: 'Dados',
        },
        {
          nome: 'Diego Oliveira Ramos',
          funcao: 'Engenheiro de dados',
          instituicao: 'LABES',
          grupo: 'Dados',
        },
        {
          nome: 'Patrícia Mendes Castro',
          funcao: 'Pesquisadora em indicadores educacionais',
          instituicao: 'Parceiros acadêmicos',
          grupo: 'Dados',
        },
      ],
    },
    {
      area: 'Garantia de Qualidade',
      descricao: 'Validação funcional, testes automatizados e garantia de qualidade da solução.',
      colaboradores: [
        {
          nome: 'Helena Carvalho Duarte',
          funcao: 'Analista de testes',
          instituicao: 'LABES',
          grupo: 'Testes',
        },
        {
          nome: 'Bruno Teixeira Gomes',
          funcao: 'Engenheiro de qualidade',
          instituicao: 'Universidade Federal do Pará',
          grupo: 'Testes',
        },
      ],
    },
  ];
}
