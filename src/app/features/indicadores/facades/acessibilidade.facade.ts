import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AcessibilidadeService } from '../../../core/api/services/acessibilidade.service';
import { FiltrosService } from '../../../core/api/services/filtros.service';
import type {
  GetAnaliseTemporalAcessibilidadeAcessibilidadeAnaliseTemporalGet$Params,
  GetPainelAcessibilidadeAcessibilidadePainelGet$Params,
  GetPainelEscolasAcessibilidadeAcessibilidadePainelEscolasGet$Params,
} from '../../../core/api';
import {
  DadosFiltrosModel,
  EscolaGeoEntryModel,
  GeoJsonFeatureCollectionModel,
  MapaAcessibilidadeModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioResumoModel,
  PainelAcessibilidadeModel,
  PainelEscolasModel,
  AnaliseTemporalModel,
  MapaPontoModel,
} from '../models/acessibilidade.models';
import {
  mapFiltrosResponseToModel,
  mapGeoJsonMunicipiosComAcessibilidade,
  mapMapaMunicipioResumoFromPontos,
  mapPainelResponseToModel,
  mapPainelEscolasResponseToModel,
  mapMapaResponseToModel,
  mapAnaliseTemporalResponseToModel,
} from '../mappers/acessibilidade.mapper';

type MapaMunicipalComPontosModel = {
  collection: MapaMunicipioGeoJsonCollectionModel;
  pontos: MapaPontoModel[];
};

@Injectable({ providedIn: 'root' })
export class AcessibilidadeFacade {
  private readonly api = inject(AcessibilidadeService);
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
    return from(this.filtrosApi.getFiltrosFiltrosGet({ painel: 'acessibilidade' })).pipe(
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
  }): Observable<PainelAcessibilidadeModel> {
    const call = async () => {
      const apiResp = await this.api.getPainelAcessibilidadeAcessibilidadePainelGet({
        ano: params?.ano ?? null,
        variaveis:
          params?.variaveis as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['variaveis'],
        municipios: params?.municipios as string[],
        rede_ensino:
          params?.rede_ensino as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['rede_ensino'],
        tp_localizacao:
          params?.tp_localizacao as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['tp_localizacao'],
        pibid: params?.pibid ?? undefined,
      });
      return mapPainelResponseToModel(apiResp);
    };

    return from(call()).pipe(catchError(() => of({ descricao: '', graficos: {} })));
  }

  listarPainelEscolas(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
    pibid?: boolean | null;
    page?: number;
    page_size?: number;
  }): Observable<PainelEscolasModel> {
    const call = async () => {
      const apiResp = await this.api.getPainelEscolasAcessibilidadeAcessibilidadePainelEscolasGet({
        ano: params?.ano ?? null,
        variaveis:
          params?.variaveis as GetPainelEscolasAcessibilidadeAcessibilidadePainelEscolasGet$Params['variaveis'],
        municipios: params?.municipios as string[],
        rede_ensino:
          params?.rede_ensino as GetPainelEscolasAcessibilidadeAcessibilidadePainelEscolasGet$Params['rede_ensino'],
        tp_localizacao:
          params?.tp_localizacao as GetPainelEscolasAcessibilidadeAcessibilidadePainelEscolasGet$Params['tp_localizacao'],
        pibid: params?.pibid ?? undefined,
        page: params?.page ?? 0,
        page_size: params?.page_size ?? 5,
      });
      return mapPainelEscolasResponseToModel(apiResp);
    };

    return from(call()).pipe(
      catchError(() =>
        of({
          grafico: { plotly: { data: [], layout: {} }, tipo: '', titulo: '' },
          paginacao: { page: 0, page_size: 5, total_escolas: 0, total_paginas: 0 },
        }),
      ),
    );
  }

  listarMapa(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    pibid?: boolean | null;
  }): Observable<MapaAcessibilidadeModel> {
    const call = async () => {
      const [apiResp, geoMap] = await Promise.all([
        this.api.getMapaAcessibilidadeAcessibilidadeMapaGet({
          ano: params?.ano ?? null,
          variaveis:
            params?.variaveis as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['variaveis'],
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
      this.api.getAnaliseTemporalAcessibilidadeAcessibilidadeAnaliseTemporalGet({
        metrica: (params?.metrica ??
          undefined) as GetAnaliseTemporalAcessibilidadeAcessibilidadeAnaliseTemporalGet$Params['metrica'],
        pibid: params?.pibid ?? undefined,
      }),
    ).pipe(
      map(mapAnaliseTemporalResponseToModel),
      catchError(() => of({ descricao: '', graficos: {}, listaGraficos: [] })),
    );
  }

  listarMapaMunicipalGeoJson(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    pibid?: boolean | null;
  }): Observable<MapaMunicipioGeoJsonCollectionModel> {
    const call = async () => {
      const [mapa, geojson] = await Promise.all([
        firstValueFrom(this.listarMapa(params)),
        firstValueFrom(
          this.http.get<GeoJsonFeatureCollectionModel>(
            'assets/geojson/PA_Municipios_Pibid_2025.json',
          ),
        ),
      ]);

      const resumos: MapaMunicipioResumoModel[] = mapMapaMunicipioResumoFromPontos(mapa.pontos);
      return mapGeoJsonMunicipiosComAcessibilidade(
        geojson,
        resumos,
        params?.municipios?.map((nome) => ({ nome })) ?? null,
      );
    };

    return from(call()).pipe(
      catchError(() =>
        of({ type: 'FeatureCollection', features: [] } as MapaMunicipioGeoJsonCollectionModel),
      ),
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
          this.http.get<GeoJsonFeatureCollectionModel>(
            'assets/geojson/PA_Municipios_Pibid_2025.json',
          ),
        ),
      ]);

      const resumos: MapaMunicipioResumoModel[] = mapMapaMunicipioResumoFromPontos(mapa.pontos);
      return {
        collection: mapGeoJsonMunicipiosComAcessibilidade(
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
