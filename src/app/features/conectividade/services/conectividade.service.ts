import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  PainelConectividadeModel,
  MapaConectividadeModel,
  AnaliseTemporalModel,
} from '../models/conectividade.models';

type ApiParams = Record<string, string | number | boolean | string[] | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ConectividadeService {
  private readonly api = inject(ApiService);

  getPainel(params?: ApiParams): Observable<PainelConectividadeModel> {
    return this.api.get<PainelConectividadeModel>('/conectividade/painel', params);
  }

  getMapa(params?: ApiParams): Observable<MapaConectividadeModel> {
    return this.api.get<MapaConectividadeModel>('/conectividade/mapa', params);
  }

  getAnaliseTemporal(params?: ApiParams): Observable<AnaliseTemporalModel> {
    return this.api.get<AnaliseTemporalModel>('/conectividade/analise-temporal', params);
  }
}
