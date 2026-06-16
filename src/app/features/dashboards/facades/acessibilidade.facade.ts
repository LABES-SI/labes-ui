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
  GetMapaAcessibilidadeAcessibilidadeMapaGet$Params,
} from '../../../core/api';
import {
  DadosFiltrosModel,
  GeoJsonFeatureCollectionModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioResumoModel,
  PainelAcessibilidadeModel,
  PainelEscolasModel,
  MapaAcessibilidadeModel,
  AnaliseTemporalModel,
  MapaMunicipioModel,
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
  }): Observable<PainelAcessibilidadeModel> {
    const call = async () => {
      const ano = params?.ano ?? null;
      const variaveis = params?.variaveis ?? null;
      const municipios = params?.municipios ?? null;
      const rede_ensino = params?.rede_ensino ?? null;
      const tp_localizacao = params?.tp_localizacao ?? null;

      const apiResp = await this.api.getPainelAcessibilidadeAcessibilidadePainelGet({
        ano: ano ?? null,
        variaveis: variaveis as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['variaveis'],
        municipios: municipios as string[],
        rede_ensino:
          rede_ensino as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['rede_ensino'],
        tp_localizacao:
          tp_localizacao as GetPainelAcessibilidadeAcessibilidadePainelGet$Params['tp_localizacao'],
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
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  }): Observable<MapaAcessibilidadeModel> {
    const call = async () => {
      const ano = params?.ano ?? null;
      const variaveis = params?.variaveis ?? null;
      const municipios = params?.municipios ?? null;
      const rede_ensino = params?.rede_ensino ?? null;
      const tp_localizacao = params?.tp_localizacao ?? null;

      const apiResp = await this.api.getMapaAcessibilidadeAcessibilidadeMapaGet({
        ano: ano ?? null,
        variaveis: variaveis as GetMapaAcessibilidadeAcessibilidadeMapaGet$Params['variaveis'],
        municipios: municipios as string[],
        rede_ensino:
          rede_ensino as GetMapaAcessibilidadeAcessibilidadeMapaGet$Params['rede_ensino'],
        tp_localizacao:
          tp_localizacao as GetMapaAcessibilidadeAcessibilidadeMapaGet$Params['tp_localizacao'],
      });
      return mapMapaResponseToModel(apiResp);
    };

    return from(call()).pipe(catchError(() => of({ descricao: '', pontos: [] })));
  }

  listarAnaliseTemporal(params?: { metrica?: string | null }): Observable<AnaliseTemporalModel> {
    return from(
      this.api.getAnaliseTemporalAcessibilidadeAcessibilidadeAnaliseTemporalGet({
        metrica: (params?.metrica ??
          undefined) as GetAnaliseTemporalAcessibilidadeAcessibilidadeAnaliseTemporalGet$Params['metrica'],
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
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
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

  listarMapaAgrupadoPorMunicipio(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
  }): Observable<MapaMunicipioModel[]> {
    return this.listarMapa(params).pipe(
      map((m) => {
        return mapMapaMunicipioResumoFromPontos(m.pontos).map((item) => ({
          municipio: item.municipio,
          media_score: item.media_score,
          quantidade_escolas: item.quantidade_escolas,
          classificacao: item.classificacao,
          cor: item.cor,
        }));
      }),
    );
  }
}
