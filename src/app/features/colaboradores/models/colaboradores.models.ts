export interface Colaborador {
  nome: string;
  funcao: string;
  instituicao: string;
  grupo: string;
}

export interface AreaColaboradores {
  area: string;
  descricao: string;
  colaboradores: Colaborador[];
}
