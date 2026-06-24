import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConectividadeService } from '../../../core/api/services/conectividade.service';
import { FiltrosService } from '../../../core/api/services/filtros.service';
import type {
  GetAnaliseTemporalConectividadeConectividadeAnaliseTemporalGet$Params,
  GetPainelConectividadeConectividadePainelGet$Params,
} from '../../../core/api';
import {
  AnaliseTemporalModel,
  DadosFiltrosModel,
  EscolaGeoEntryModel,
  GeoJsonFeatureCollectionModel,
  MapaConectividadeModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioResumoModel,
  MapaPontoModel,
  PainelConectividadeModel,
} from '../models/conectividade.models';
import {
  mapAnaliseTemporalResponseToModel,
  mapFiltrosResponseToModel,
  mapGeoJsonMunicipiosComConectividade,
  mapMapaMunicipioResumoFromPontos,
  mapMapaResponseToModel,
  mapPainelResponseToModel,
} from '../mappers/conectividade.mapper';

type MapaMunicipalComPontosModel = {
  collection: MapaMunicipioGeoJsonCollectionModel;
  pontos: MapaPontoModel[];
};

@Injectable({ providedIn: 'root' })
export class ConectividadeFacade {
  private readonly api = inject(ConectividadeService);
  private readonly filtrosApi = inject(FiltrosService);
  private readonly http = inject(HttpClient);

  private escolasGeoMap$: Promise<Map<number, EscolaGeoEntryModel>> | null = null;

  private getEscolasGeoMap(): Promise<Map<number, EscolaGeoEntryModel>> {
    if (!this.escolasGeoMap$) {
      this.escolasGeoMap$ = firstValueFrom(
        this.http.get<EscolaGeoEntryModel[]>('assets/geojson/escolas_geo.json'),
      ).then((entries) => new Map(entries.map((e) => [e.co_entidade, e])));
    }
    return this.escolasGeoMap$;
  }

  listarFiltros(): Observable<DadosFiltrosModel> {
    return from(this.filtrosApi.getFiltrosFiltrosGet({ painel: 'conectividade' })).pipe(
      map(mapFiltrosResponseToModel),
      catchError(() =>
        of({ anos: [], metricas: [], municipios: [], rede_ensino: [], tp_localizacao: [] }),
      ),
    );
  }

  listarPainel(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
    pibid?: boolean | null;
  }): Observable<PainelConectividadeModel> {
    const call = async () => {
      const apiResp = await this.api.getPainelConectividadeConectividadePainelGet({
        ano: params?.ano ?? null,
        variaveis:
          params?.variaveis as GetPainelConectividadeConectividadePainelGet$Params['variaveis'],
        municipios: params?.municipios as string[],
        rede_ensino:
          params?.rede_ensino as GetPainelConectividadeConectividadePainelGet$Params['rede_ensino'],
        tp_localizacao:
          params?.tp_localizacao as GetPainelConectividadeConectividadePainelGet$Params['tp_localizacao'],
        pibid: params?.pibid ?? undefined,
      });
      return mapPainelResponseToModel(apiResp);
    };

    return from(call()).pipe(catchError(() => of({ descricao: '', graficos: {} })));
  }

  listarMapa(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    pibid?: boolean | null;
  }): Observable<MapaConectividadeModel> {
    const call = async () => {
      const [apiResp, geoMap] = await Promise.all([
        this.api.getMapaConectividadeConectividadeMapaGet({
          ano: params?.ano ?? null,
          variaveis:
            params?.variaveis as GetPainelConectividadeConectividadePainelGet$Params['variaveis'],
          pibid: params?.pibid ?? undefined,
        }),
        this.getEscolasGeoMap(),
      ]);
      return mapMapaResponseToModel(apiResp, geoMap);
    };

    return from(call()).pipe(catchError(() => of({ descricao: '', pontos: [] })));
  }

  listarAnaliseTemporal(params?: {
    metrica?: string | null;
    pibid?: boolean | null;
  }): Observable<AnaliseTemporalModel> {
    return from(
      this.api.getAnaliseTemporalConectividadeConectividadeAnaliseTemporalGet({
        metrica: (params?.metrica ??
          undefined) as GetAnaliseTemporalConectividadeConectividadeAnaliseTemporalGet$Params['metrica'],
        pibid: params?.pibid ?? undefined,
      }),
    ).pipe(
      map(mapAnaliseTemporalResponseToModel),
      catchError(() => of({ descricao: '', graficos: {}, listaGraficos: [] })),
    );
  }

  listarMapaMunicipalGeoJsonComPontos(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    pibid?: boolean | null;
  }): Observable<MapaMunicipalComPontosModel> {
    const call = async () => {
      const [mapa, geojson] = await Promise.all([
        firstValueFrom(this.listarMapa(params)),
        firstValueFrom(
          this.http
            .get<GeoJsonFeatureCollectionModel>('assets/geojson/PA_Municipios_Pibid_2025.json')
            .pipe(
              catchError(() =>
                of({ type: 'FeatureCollection', features: [] } as GeoJsonFeatureCollectionModel),
              ),
            ),
        ),
      ]);

      const resumos: MapaMunicipioResumoModel[] = mapMapaMunicipioResumoFromPontos(mapa.pontos);
      return {
        collection: mapGeoJsonMunicipiosComConectividade(
          geojson,
          resumos,
          params?.municipios?.map((nome) => ({ nome })) ?? null,
        ),
        pontos: mapa.pontos,
      };
    };

    return from(call()).pipe(
      catchError(() =>
        of({
          collection: {
            type: 'FeatureCollection',
            features: [],
          } as MapaMunicipioGeoJsonCollectionModel,
          pontos: [],
        }),
      ),
    );
  }
}
