import { TermoGlossario } from '../models/glossario.models';

export const GLOSSARIO_MOCK: TermoGlossario[] = [
  {
    id: 'ideb',
    termo: 'Índice de Desenvolvimento da Educação Básica (IDEB)',
    categoria: 'desempenho',
    definicao:
      'Indicador que mede a qualidade do aprendizado nacional e estabelece metas para a melhoria do ensino.',
    exemplo: 'Uma escola que atingiu nota 6.0 no Ideb superou a média estipulada para a região.',
    referenciaInep: {
      texto: 'Metodologia de Cálculo do Ideb - Inep',
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb',
    },
  },
  {
    id: 'taxa-distorcao-idade-serie',
    termo: 'Taxa de Distorção Idade-Série',
    categoria: 'fluxo',
    definicao:
      'Percentual de alunos que têm idade superior à idade recomendada para a série que estão cursando.',
    exemplo: 'Um aluno com 15 anos matriculado no 6º ano do Ensino Fundamental.',
    referenciaInep: {
      texto: 'Indicadores Estatísticos de Fluxo Escolar - Inep',
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
    },
  },
  {
    id: 'infraestrutura-escolar',
    termo: 'Índice de Infraestrutura Escolar',
    categoria: 'infraestrutura',
    definicao:
      'Métrica que avalia a presença de itens essenciais nas escolas, como água encanada, internet e laboratórios.',
    exemplo:
      'Análise de quantas escolas do município possuem laboratório de informática totalmente funcional.',
    referenciaInep: {
      texto: 'Censo Escolar e Infraestrutura - Inep',
      url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar',
    },
  },
];
