import { AnaliseTemporalResponse } from '../../../core/api/models/analise-temporal-response';
import { FiltrosResponse } from '../../../core/api/models/filtros-response';
import { MapaResponse } from '../../../core/api/models/mapa-response';
import { PainelEscolasResponse } from '../../../core/api/models/painel-escolas-response';
import { PainelResponse } from '../../../core/api/models/painel-response';
import {
  AnaliseTemporalModel,
  ClassificacaoAcessibilidadeModel,
  DadosFiltrosModel,
  GeoJsonFeatureCollectionModel,
  MapaAcessibilidadeModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioGeoJsonModel,
  MapaMunicipioGeoJsonPropertiesModel,
  MapaMunicipioResumoModel,
  MapaPontoModel,
  PainelAcessibilidadeModel,
  PainelEscolasModel,
  GraficoModel,
  GraficoListaModel,
} from '../models/acessibilidade.models';

function normalizarTexto(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export function classificarScoreMedio(score: number): ClassificacaoAcessibilidadeModel {
  if (!Number.isFinite(score) || score <= 0) {
    return 'Inexistente';
  }

  if (score >= 8) {
    return 'Boa';
  }

  if (score >= 5) {
    return 'Média';
  }

  return 'Baixa';
}

export function corPorClassificacao(classificacao: ClassificacaoAcessibilidadeModel): string {
  switch (classificacao) {
    case 'Boa':
      return '#0f766e';
    case 'Média':
      return '#f59e0b';
    case 'Baixa':
      return '#dc2626';
    case 'Inexistente':
    default:
      return '#94a3b8';
  }
}

export function mapMapaMunicipioResumoFromPontos(
  pontos: MapaPontoModel[],
): MapaMunicipioResumoModel[] {
  const agrupados = new Map<string, { municipio: string | null; sum: number; count: number }>();

  for (const ponto of pontos) {
    if (!ponto.municipio) {
      continue;
    }

    const chave = normalizarTexto(ponto.municipio);
    const atual = agrupados.get(chave) ?? { municipio: ponto.municipio, sum: 0, count: 0 };
    atual.sum += ponto.score ?? 0;
    atual.count += 1;
    agrupados.set(chave, atual);
  }

  return Array.from(agrupados.values())
    .map((item) => {
      const media = item.count ? item.sum / item.count : 0;
      const classificacao = classificarScoreMedio(media);

      return {
        municipio: item.municipio,
        media_score: media,
        quantidade_escolas: item.count,
        classificacao,
        cor: corPorClassificacao(classificacao),
      };
    })
    .sort((a, b) => b.media_score - a.media_score);
}

export function mapGeoJsonMunicipiosComAcessibilidade(
  geojson: GeoJsonFeatureCollectionModel,
  resumos: MapaMunicipioResumoModel[],
  municipiosDisponiveis?: Array<{ nome: string }> | null,
): MapaMunicipioGeoJsonCollectionModel {
  const resumosPorMunicipio = new Map(
    resumos.map((item) => [normalizarTexto(item.municipio), item]),
  );
  const municipiosNormalizados = (municipiosDisponiveis ?? []).map((item) =>
    normalizarTexto(item.nome),
  );
  const filtrarMunicipios = municipiosNormalizados.length > 0;
  const municipiosPermitidos = new Set(municipiosNormalizados);
  const scores: number[] = resumos
    .filter((r) => !filtrarMunicipios || municipiosPermitidos.has(normalizarTexto(r.municipio)))
    .map((r) => r.media_score)
    .filter((v) => Number.isFinite(v));

  let minScore = Infinity;
  let maxScore = -Infinity;

  for (const s of scores) {
    if (s < minScore) minScore = s;
    if (s > maxScore) maxScore = s;
  }

  if (!isFinite(minScore)) {
    minScore = 0;
    maxScore = 0;
  }

  const getColorForScore = (score: number, fallback: string) => {
    if (!Number.isFinite(score)) return fallback;
    let t = 0.5;
    if (maxScore !== minScore) {
      t = (score - minScore) / (maxScore - minScore);
      t = Math.max(0, Math.min(1, t));
    }
    const hue = Math.round(120 * t); // 0 = red, 120 = green
    return `hsl(${hue}, 75%, 45%)`;
  };

  return {
    type: 'FeatureCollection',
    features: geojson.features
      .filter((feature) => {
        if (!filtrarMunicipios) {
          return true;
        }

        return municipiosPermitidos.has(
          normalizarTexto(String(feature.properties?.['NM_MUN'] ?? '')),
        );
      })
      .map((feature) => {
        const nomeMunicipio = String(feature.properties?.['NM_MUN'] ?? '');
        const resumo = resumosPorMunicipio.get(normalizarTexto(nomeMunicipio));
        const classificacao = resumo?.classificacao ?? 'Inexistente';
        const fallbackCor = corPorClassificacao(classificacao);
        const cor = resumo ? getColorForScore(resumo.media_score ?? NaN, fallbackCor) : fallbackCor;

        const properties: MapaMunicipioGeoJsonPropertiesModel = {
          ...(feature.properties as Record<string, unknown>),
          CD_MUN: String(feature.properties?.['CD_MUN'] ?? ''),
          NM_MUN: nomeMunicipio,
          media_score: resumo?.media_score ?? 0,
          quantidade_escolas: resumo?.quantidade_escolas ?? 0,
          classificacao_acessibilidade_municipio: classificacao,
          cor,
        };

        const featureModel: MapaMunicipioGeoJsonModel = {
          type: 'Feature',
          geometry: feature.geometry,
          properties,
        };

        return featureModel;
      }),
  };
}

export function mapFiltrosResponseToModel(api: FiltrosResponse): DadosFiltrosModel {
  return {
    anos: api.data.anos ?? [],
    metricas: api.data.metricas ?? [],
    municipios: api.data.municipios ?? [],
    rede_ensino: api.data.rede_ensino ?? [],
    tp_localizacao: api.data.tp_localizacao ?? [],
  };
}

export function mapPainelResponseToModel(api: PainelResponse): PainelAcessibilidadeModel {
  const data = api.data;

  const graficos: { [key: string]: GraficoModel } = Object.keys(data.graficos || {}).reduce(
    (acc, key) => {
      const g = data.graficos[key];
      acc[key] = {
        plotly: g.plotly,
        tipo: g.tipo,
        titulo: g.titulo,
      };
      return acc;
    },
    {} as { [key: string]: GraficoModel },
  );

  return {
    descricao: api.descricao,
    graficos,
  };
}

export function mapPainelEscolasResponseToModel(api: PainelEscolasResponse): PainelEscolasModel {
  const { grafico, paginacao } = api.data;
  return {
    grafico: {
      plotly: grafico.plotly,
      tipo: grafico.tipo,
      titulo: grafico.titulo,
    },
    paginacao: {
      page: paginacao.page,
      page_size: paginacao.page_size,
      total_escolas: paginacao.total_escolas,
      total_paginas: paginacao.total_paginas,
    },
  };
}

export function mapMapaResponseToModel(api: MapaResponse): MapaAcessibilidadeModel {
  const pontos: MapaPontoModel[] = (api.data.pontos || []).map((p) => ({
    ...p,
    co_entidade: p.co_entidade,
    nome: p.no_entidade,
    municipio: p.no_municipio,
    latitude: p.latitude,
    longitude: p.longitude,
    score: p.score_acessibilidade,
    classificacao: p.classificacao_acessibilidade,
  }));

  return {
    descricao: api.descricao,
    pontos,
  };
}

export function mapAnaliseTemporalResponseToModel(
  api: AnaliseTemporalResponse,
): AnaliseTemporalModel {
  const data = api.data;

  const graficos: { [key: string]: GraficoModel } = Object.keys(data.graficos || {}).reduce(
    (acc, key) => {
      const g = data.graficos[key];
      acc[key] = {
        plotly: g.plotly,
        tipo: g.tipo,
        titulo: g.titulo,
      };
      return acc;
    },
    {} as { [key: string]: GraficoModel },
  );

  const listaGraficos: GraficoListaModel[] = Object.entries(graficos).map(([chave, grafico]) => ({
    chave,
    ...grafico,
  }));

  return {
    descricao: api.descricao,
    graficos,
    listaGraficos,
  };
}
