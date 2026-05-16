import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AreaObservatorio, EscolaDestaque, IndicadorResumo } from '../models/inicio.models';

@Injectable({ providedIn: 'root' })
export class InicioFacade {
  listarIndicadoresResumo(): Observable<readonly IndicadorResumo[]> {
    return of([
      {
        titulo: 'Matrículas',
        valor: '12.450',
        descricao: 'Total mockado para composição inicial da página.',
      },
      {
        titulo: 'Escolas',
        valor: '128',
        descricao: 'Quantidade mockada de escolas acompanhadas.',
      },
      {
        titulo: 'Indicadores',
        valor: '24',
        descricao: 'Indicadores preparados para futuras consultas.',
      },
    ]);
  }

  listarEscolasDestaque(): Observable<readonly EscolaDestaque[]> {
    return of([
      { nome: 'Escola Municipal Paulo Freire', municipio: 'Fortaleza', indicador: 'IDEB 6.2' },
      { nome: 'Escola Estadual Darcy Ribeiro', municipio: 'Sobral', indicador: 'IDEB 6.8' },
    ]);
  }

  listarAreasObservatorio(): Observable<readonly AreaObservatorio[]> {
    return of([
      {
        titulo: 'Indicadores',
        descricao: 'Consulta de métricas educacionais por território e período.',
      },
      {
        titulo: 'Escolas',
        descricao: 'Informações sintéticas sobre unidades escolares.',
      },
      {
        titulo: 'Publicações',
        descricao: 'Materiais analíticos e relatórios do observatório.',
      },
    ]);
  }
}
