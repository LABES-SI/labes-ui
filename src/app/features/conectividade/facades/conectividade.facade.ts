import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConectividadeService } from '../services/conectividade.service';
import {
  GeoJsonFeatureCollectionModel,
  MapaMunicipioGeoJsonCollectionModel,
  PainelConectividadeModel,
  MapaConectividadeModel,
  AnaliseTemporalModel,
  MapaPontoModel,
  ClassificacaoConectividadeModel,
} from '../models/conectividade.models';

type ApiParams = Record<string, string | number | boolean | string[] | null | undefined>;

type MapaMunicipalComPontosModel = {
  collection: MapaMunicipioGeoJsonCollectionModel;
  pontos: MapaPontoModel[];
};

@Injectable({ providedIn: 'root' })
export class ConectividadeFacade {
  private readonly api = inject(ConectividadeService);
  private readonly http = inject(HttpClient);

  listarPainel(params?: ApiParams): Observable<PainelConectividadeModel> {
    return this.api.getPainel(params).pipe(
      catchError(() =>
        of({
          descricao: '',
          dadosFiltros: {
            anos: [],
            metricas: [],
            municipios: [],
            rede_ensino: [],
            tp_localizacao: [],
            situacao_conectividade: [],
          },
          graficos: {},
        }),
      ),
    );
  }

  listarMapa(params?: ApiParams): Observable<MapaConectividadeModel> {
    return this.api.getMapa(params).pipe(catchError(() => of({ descricao: '', pontos: [] })));
  }

  listarAnaliseTemporal(params?: ApiParams): Observable<AnaliseTemporalModel> {
    return this.api
      .getAnaliseTemporal(params)
      .pipe(
        catchError(() =>
          of({ descricao: '', dadosFiltros: { metricas: [] }, graficos: {}, listaGraficos: [] }),
        ),
      );
  }

  listarMapaMunicipalGeoJsonComPontos(params?: ApiParams): Observable<MapaMunicipalComPontosModel> {
    const call = async () => {
      const [, mapa, geojson] = await Promise.all([
        firstValueFrom(this.listarPainel(params)),
        firstValueFrom(this.listarMapa(params)),
        firstValueFrom(
          this.http
            .get<GeoJsonFeatureCollectionModel>('assets/geojson/PA_Municipios_2025.json')
            .pipe(
              catchError(() =>
                of({ type: 'FeatureCollection', features: [] } as GeoJsonFeatureCollectionModel),
              ),
            ),
        ),
      ]);

      return {
        collection: this.mapGeoJsonMunicipiosComConectividade(geojson),
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

  private mapGeoJsonMunicipiosComConectividade(
    geojson: GeoJsonFeatureCollectionModel,
  ): MapaMunicipioGeoJsonCollectionModel {
    return {
      type: 'FeatureCollection',
      features: geojson.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          CD_MUN: String(feature.properties['CD_MUN']),
          NM_MUN: String(feature.properties['NM_MUN']),
          media_score: 0,
          quantidade_escolas: 0,
          classificacao_conectividade_municipio:
            'Sem Conectividade' as ClassificacaoConectividadeModel,
          cor: '#cccccc',
        },
      })),
    } as MapaMunicipioGeoJsonCollectionModel;
  }
}
