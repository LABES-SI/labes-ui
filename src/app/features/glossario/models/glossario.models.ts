export type CategoriaGlossario = 'desempenho' | 'fluxo' | 'infraestrutura';

export interface ReferenciaInep {
  texto: string;
  url: string;
}

export interface TermoGlossario {
  id: string;
  termo: string;
  categoria: CategoriaGlossario;
  definicao: string;
  exemplo: string;
  referenciaInep: ReferenciaInep;
}
