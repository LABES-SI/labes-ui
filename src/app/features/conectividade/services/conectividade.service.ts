import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  PainelConectividadeModel,
  MapaConectividadeModel,
  AnaliseTemporalModel,
} from '../models/conectividade.models';

type ApiParams = Record<string, string | number | boolean | string[] | null | undefined>;

function buildHttpParams(params?: ApiParams): HttpParams {
  let p = new HttpParams();
  if (!params) return p;
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) p = p.append(key, String(v));
    } else {
      p = p.set(key, String(value));
    }
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class ConectividadeService {
  private readonly api = inject(ApiService);

  getPainel(params?: ApiParams): Observable<PainelConectividadeModel> {
    return this.api.get<PainelConectividadeModel>('/conectividade/painel', buildHttpParams(params));
  }

  getMapa(params?: ApiParams): Observable<MapaConectividadeModel> {
    return this.api.get<MapaConectividadeModel>('/conectividade/mapa', buildHttpParams(params));
  }

  getAnaliseTemporal(params?: ApiParams): Observable<AnaliseTemporalModel> {
    return this.api.get<AnaliseTemporalModel>(
      '/conectividade/analise-temporal',
      buildHttpParams(params),
    );
  }
}
