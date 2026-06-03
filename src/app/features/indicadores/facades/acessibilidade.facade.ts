import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AcessibilidadeService } from '../../../core/api/services/acessibilidade.service';
import type {
  GetAnaliseTemporalAcessibilidadeAcessibilidadeAnaliseTemporalGet$Params,
  GetPainelAcessibilidadeAcessibilidadePainelGet$Params,
  GetMapaAcessibilidadeAcessibilidadeMapaGet$Params,
} from '../../../core/api';
import {
  GeoJsonFeatureCollectionModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioResumoModel,
  PainelAcessibilidadeModel,
  MapaAcessibilidadeModel,
  AnaliseTemporalModel,
  MapaMunicipioModel,
  MapaPontoModel,
} from '../models/acessibilidade.models';
import {
  mapGeoJsonMunicipiosComAcessibilidade,
  mapMapaMunicipioResumoFromPontos,
  mapPainelResponseToModel,
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
  private readonly http = inject(HttpClient);

  private async getMostRecentYear(): Promise<number | undefined> {
    try {
      const resp = await this.api.getPainelAcessibilidadeAcessibilidadePainelGet();
      const anos: number[] = (resp.data?.dados_filtros as { anos?: number[] })?.anos ?? [];
      if (anos.length === 0) return undefined;
      return Math.max(...anos);
    } catch {
      return undefined;
    }
  }

  listarPainel(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  }): Observable<PainelAcessibilidadeModel> {
    const call = async () => {
      let ano = params?.ano ?? null;
      const variaveis = params?.variaveis ?? null;
      const municipios = params?.municipios ?? null;
      const rede_ensino = params?.rede_ensino ?? null;
      const tp_localizacao = params?.tp_localizacao ?? null;

      if (ano == null) {
        const recent = await this.getMostRecentYear();
        ano = recent ?? null;
      }

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

    return from(call()).pipe(
      catchError(() =>
        of({
          descricao: '',
          dadosFiltros: {
            anos: [],
            metricas: [],
            municipios: [],
            rede_ensino: [],
            tp_localizacao: [],
          },
          graficos: {},
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
      let ano = params?.ano ?? null;
      const variaveis = params?.variaveis ?? null;
      const municipios = params?.municipios ?? null;
      const rede_ensino = params?.rede_ensino ?? null;
      const tp_localizacao = params?.tp_localizacao ?? null;

      if (ano == null) {
        const recent = await this.getMostRecentYear();
        ano = recent ?? null;
      }

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
      catchError(() =>
        of({ descricao: '', dadosFiltros: { metricas: [] }, graficos: {}, listaGraficos: [] }),
      ),
    );
  }

  listarMapaMunicipalGeoJson(params?: {
    ano?: number | null;
    variaveis?: string[] | null;
    municipios?: string[] | null;
  }): Observable<MapaMunicipioGeoJsonCollectionModel> {
    const call = async () => {
      const [painel, mapa, geojson] = await Promise.all([
        firstValueFrom(this.listarPainel(params)),
        firstValueFrom(this.listarMapa(params)),
        firstValueFrom(
          this.http.get<GeoJsonFeatureCollectionModel>('assets/geojson/PA_Municipios_2025.json'),
        ),
      ]);

      const resumos: MapaMunicipioResumoModel[] = mapMapaMunicipioResumoFromPontos(mapa.pontos);
      return mapGeoJsonMunicipiosComAcessibilidade(
        geojson,
        resumos,
        painel.dadosFiltros.municipios,
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
      const [painel, mapa, geojson] = await Promise.all([
        firstValueFrom(this.listarPainel(params)),
        firstValueFrom(this.listarMapa(params)),
        firstValueFrom(
          this.http.get<GeoJsonFeatureCollectionModel>('assets/geojson/PA_Municipios_2025.json'),
        ),
      ]);

      const resumos: MapaMunicipioResumoModel[] = mapMapaMunicipioResumoFromPontos(mapa.pontos);
      return {
        collection: mapGeoJsonMunicipiosComAcessibilidade(
          geojson,
          resumos,
          painel.dadosFiltros.municipios,
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
