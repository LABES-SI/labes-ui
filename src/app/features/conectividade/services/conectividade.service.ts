import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  PainelConectividadeModel,
  MapaConectividadeModel,
  AnaliseTemporalModel,
} from '../models/conectividade.models';

@Injectable({ providedIn: 'root' })
export class ConectividadeService {
  private readonly api = inject(ApiService);

  getPainel(params?: any): Observable<PainelConectividadeModel> {
    return this.api.get<PainelConectividadeModel>('/conectividade/painel', params);
  }

  getMapa(params?: any): Observable<MapaConectividadeModel> {
    return this.api.get<MapaConectividadeModel>('/conectividade/mapa', params);
  }

  getAnaliseTemporal(params?: any): Observable<AnaliseTemporalModel> {
    return this.api.get<AnaliseTemporalModel>('/conectividade/analise-temporal', params);
  }
}
