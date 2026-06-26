export type CategoriaGlossario = 'desempenho' | 'fluxo' | 'infraestrutura';

export interface ReferenciaInep {
  url: string;
  texto: string;
}

export interface TermoGlossario {
  /**
   * Identificador único do termo.
   * Usado para âncoras, links internos, trackBy e termos clicáveis.
   * Exemplo: "ideb", "taxa-aprovacao", "acessibilidade-predial-escolar".
   */
  id: string;

  /**
   * Nome exibido para o usuário.
   */
  termo: string;

  /**
   * Nome original da coluna/indicador na base de dados.
   * Exemplo: CO ENTIDADE, IDEB, TAXA_APROVACAO.
   */
  chaveOriginal: string;

  /**
   * Explicação simples do indicador.
   */
  definicao: string;

  /**
   * Categoria visual do termo no glossário.
   */
  categoria: CategoriaGlossario;

  /**
   * Exemplo prático de uso do indicador.
   */
  exemplo?: string;

  /**
   * Referência oficial da metodologia.
   * Pode não existir em alguns termos.
   */
  referenciaInep?: ReferenciaInep;
}

/**
 * Tipo auxiliar para cadastrar os termos sem precisar escrever o id manualmente.
 * O id será gerado automaticamente no arquivo glossario.ts.
 */
export type TermoGlossarioEntrada = Omit<TermoGlossario, 'id'> & {
  id?: string;
};
