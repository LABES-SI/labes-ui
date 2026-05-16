import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ItemSobre, MembroEquipe } from '../models/sobre.models';

@Injectable({ providedIn: 'root' })
export class SobreFacade {
  listarObjetivos(): Observable<readonly ItemSobre[]> {
    return of([
      {
        titulo: 'Centralizar informações',
        descricao: 'Organizar indicadores educacionais em uma experiência única de consulta.',
      },
      {
        titulo: 'Apoiar decisões',
        descricao: 'Disponibilizar dados para análise, planejamento e acompanhamento de políticas.',
      },
    ]);
  }

  listarEtapasFuncionamento(): Observable<readonly ItemSobre[]> {
    return of([
      {
        titulo: 'Coleta',
        descricao: 'Recebimento e preparação das bases educacionais.',
      },
      {
        titulo: 'Tratamento',
        descricao: 'Padronização, validação e organização dos indicadores.',
      },
      {
        titulo: 'Consulta',
        descricao: 'Apresentação dos dados em filtros, gráficos e tabelas.',
      },
    ]);
  }

  listarFontesDados(): Observable<readonly string[]> {
    return of(['Censo Escolar', 'Indicadores oficiais', 'Bases institucionais parceiras']);
  }

  listarEquipe(): Observable<readonly MembroEquipe[]> {
    return of([
      { nome: 'Equipe SIE', papel: 'Coordenação do observatório' },
      { nome: 'Equipe de Dados', papel: 'Tratamento e curadoria das bases' },
      { nome: 'Equipe de Tecnologia', papel: 'Desenvolvimento da plataforma' },
    ]);
  }
}
