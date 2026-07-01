import { AppSchemasAcessibilidadeAnaliseTemporalResponse } from '../../../core/api/models/app-schemas-acessibilidade-analise-temporal-response';
import { AppSchemasAcessibilidadeMapaResponse } from '../../../core/api/models/app-schemas-acessibilidade-mapa-response';
import { FiltrosResponse } from '../../../core/api/models/filtros-response';
import { PainelEscolasResponse } from '../../../core/api/models/painel-escolas-response';
import { PainelResponse } from '../../../core/api/models/painel-response';
import {
  AnaliseTemporalModel,
  ClassificacaoAcessibilidadeModel,
  DadosFiltrosModel,
  EscolaGeoEntryModel,
  GeoJsonFeatureCollectionModel,
  GraficoListaModel,
  GraficoModel,
  MapaAcessibilidadeModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioGeoJsonModel,
  MapaMunicipioGeoJsonPropertiesModel,
  MapaMunicipioResumoModel,
  MapaPontoModel,
  PainelAcessibilidadeModel,
  PainelEscolasModel,
} from '../models/acessibilidade.models';

function normalizarTexto(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function numeroOuNulo(valor: unknown): number | null {
  if (valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export function classificarScoreMedio(score: number): ClassificacaoAcessibilidadeModel {
  if (!Number.isFinite(score) || score <= 0) {
    return 'Inexistente';
  }

  if (score >= 12) {
    return 'Excelente';
  }

  if (score >= 8) {
    return 'Boa';
  }

  if (score >= 4) {
    return 'Média';
  }

  return 'Baixa';
}

export function corPorClassificacao(classificacao: ClassificacaoAcessibilidadeModel): string {
  switch (classificacao) {
    case 'Excelente':
      return '#059669';
    case 'Boa':
      return '#22c55e';
    case 'Média':
      return '#f59e0b';
    case 'Baixa':
      return '#f97316';
    case 'Inexistente':
    default:
      return '#dc2626';
  }
}

export function mapMapaMunicipioResumoFromPontos(
  pontos: MapaPontoModel[],
): MapaMunicipioResumoModel[] {
  const agrupados = new Map<
    string,
    {
      municipio: string | null;
      sum: number;
      count: number;
      ideb_2023_anos_iniciais_mun: number | null;
      ideb_2023_anos_finais_mun: number | null;
      ideb_2023_ensino_medio_mun: number | null;
      pibid_total: number;
    }
  >();

  for (const ponto of pontos) {
    if (!ponto.municipio) {
      continue;
    }

    const chave = normalizarTexto(ponto.municipio);
    const atual = agrupados.get(chave) ?? {
      municipio: ponto.municipio,
      sum: 0,
      count: 0,
      ideb_2023_anos_iniciais_mun: ponto.ideb_2023_anos_iniciais_mun ?? null,
      ideb_2023_anos_finais_mun: ponto.ideb_2023_anos_finais_mun ?? null,
      ideb_2023_ensino_medio_mun: ponto.ideb_2023_ensino_medio_mun ?? null,
      pibid_total: 0,
    };
    atual.sum += ponto.score ?? 0;
    atual.count += 1;
    atual.pibid_total += ponto.pibid ?? 0;
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
        ideb_2023_anos_iniciais_mun: item.ideb_2023_anos_iniciais_mun,
        ideb_2023_anos_finais_mun: item.ideb_2023_anos_finais_mun,
        ideb_2023_ensino_medio_mun: item.ideb_2023_ensino_medio_mun,
        pibid_total: item.pibid_total,
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
        const cor = corPorClassificacao(classificacao);

        const properties: MapaMunicipioGeoJsonPropertiesModel = {
          ...(feature.properties as Record<string, unknown>),
          CD_MUN: String(feature.properties?.['CD_MUN'] ?? ''),
          NM_MUN: nomeMunicipio,
          media_score: resumo?.media_score ?? 0,
          quantidade_escolas: resumo?.quantidade_escolas ?? 0,
          classificacao_acessibilidade_municipio: classificacao,
          cor,
          ideb_2023_anos_iniciais_mun: resumo?.ideb_2023_anos_iniciais_mun ?? null,
          ideb_2023_anos_finais_mun: resumo?.ideb_2023_anos_finais_mun ?? null,
          ideb_2023_ensino_medio_mun: resumo?.ideb_2023_ensino_medio_mun ?? null,
          pibid_total: resumo?.pibid_total ?? null,
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

export function mapMapaResponseToModel(
  api: AppSchemasAcessibilidadeMapaResponse,
  geoMap: Map<number, EscolaGeoEntryModel>,
  filtros?: {
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  },
): MapaAcessibilidadeModel {
  const cidadesPermitidas = new Set(
    (filtros?.municipios ?? []).map((item) => normalizarTexto(item)),
  );
  const redesPermitidas = new Set(
    (filtros?.rede_ensino ?? []).map((item) => normalizarTexto(item)),
  );
  const localizacoesPermitidas = new Set(
    (filtros?.tp_localizacao ?? []).map((item) => normalizarTexto(item)),
  );

  const filtrarMunicipio = cidadesPermitidas.size > 0;
  const filtrarRede = redesPermitidas.size > 0;
  const filtrarLocalizacao = localizacoesPermitidas.size > 0;

  const pontos: MapaPontoModel[] = [];

  for (const p of api.data.pontos || []) {
    const geo = geoMap.get(p.co_entidade);
    if (!geo) continue;

    if (
      (filtrarMunicipio && !cidadesPermitidas.has(normalizarTexto(geo.no_municipio))) ||
      (filtrarRede && !redesPermitidas.has(normalizarTexto(geo.no_tp_dependencia))) ||
      (filtrarLocalizacao && !localizacoesPermitidas.has(normalizarTexto(geo.no_tp_localizacao)))
    ) {
      continue;
    }

    const raw = p as unknown as Record<string, unknown>;

    pontos.push({
      co_entidade: p.co_entidade,
      nome: geo.no_entidade,
      municipio: geo.no_municipio,
      latitude: geo.latitude,
      longitude: geo.longitude,
      no_tp_dependencia: geo.no_tp_dependencia ?? null,
      no_tp_localizacao: geo.no_tp_localizacao ?? null,
      score: p.score_acessibilidade,
      classificacao: p.classificacao_acessibilidade,
      ideb_2023_anos_iniciais: numeroOuNulo(raw['ideb_2023_anos_iniciais']),
      ideb_2023_anos_finais: numeroOuNulo(raw['ideb_2023_anos_finais']),
      ideb_2023_ensino_medio: numeroOuNulo(raw['ideb_2023_ensino_medio']),
      ideb_2023_anos_iniciais_mun: numeroOuNulo(raw['ideb_2023_anos_iniciais_mun']),
      ideb_2023_anos_finais_mun: numeroOuNulo(raw['ideb_2023_anos_finais_mun']),
      ideb_2023_ensino_medio_mun: numeroOuNulo(raw['ideb_2023_ensino_medio_mun']),
      pibid: numeroOuNulo(p.pibid),
      in_acessibilidade_rampas: numeroOuNulo(p.in_acessibilidade_rampas),
      in_acessibilidade_corrimao: numeroOuNulo(p.in_acessibilidade_corrimao),
      in_acessibilidade_elevador: numeroOuNulo(p.in_acessibilidade_elevador),
      in_acessibilidade_pisos_tateis: numeroOuNulo(p.in_acessibilidade_pisos_tateis),
      in_acessibilidade_vao_livre: numeroOuNulo(p.in_acessibilidade_vao_livre),
      in_acessibilidade_inexistente: numeroOuNulo(p.in_acessibilidade_inexistente),
      in_acessibilidade_sinal_tatil: numeroOuNulo(p.in_acessibilidade_sinal_tatil),
      in_acessibilidade_sinal_sonoro: numeroOuNulo(p.in_acessibilidade_sinal_sonoro),
      in_acessibilidade_sinal_visual: numeroOuNulo(p.in_acessibilidade_sinal_visual),
      in_sala_atendimento_especial: numeroOuNulo(p.in_sala_atendimento_especial),
      in_reserva_pcd: numeroOuNulo(p.in_reserva_pcd),
      qt_salas_utilizadas_acessiveis: numeroOuNulo(p.qt_salas_utilizadas_acessiveis),
      tp_aee: numeroOuNulo(p.tp_aee),
      qt_prof_psicologo: numeroOuNulo(p.qt_prof_psicologo),
      qt_prof_assist_social: numeroOuNulo(p.qt_prof_assist_social),
    });
  }

  return {
    descricao: api.descricao,
    pontos,
  };
}

export function mapAnaliseTemporalResponseToModel(
  api: AppSchemasAcessibilidadeAnaliseTemporalResponse,
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
