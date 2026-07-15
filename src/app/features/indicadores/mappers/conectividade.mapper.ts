import { AppSchemasConectividadeAnaliseTemporalResponse } from '../../../core/api/models/app-schemas-conectividade-analise-temporal-response';
import { AppSchemasConectividadeMapaResponse } from '../../../core/api/models/app-schemas-conectividade-mapa-response';
import { FiltrosResponse } from '../../../core/api/models/filtros-response';
import { PainelEscolasResponse } from '../../../core/api/models/painel-escolas-response';
import { PainelResponse } from '../../../core/api/models/painel-response';
import {
  AnaliseTemporalModel,
  ClassificacaoConectividadeModel,
  DadosFiltrosModel,
  EscolaGeoEntryModel,
  GeoJsonFeatureCollectionModel,
  GraficoListaModel,
  GraficoModel,
  MapaConectividadeModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioGeoJsonModel,
  MapaMunicipioGeoJsonPropertiesModel,
  MapaMunicipioResumoModel,
  MapaPontoModel,
  PainelConectividadeModel,
  PainelEscolasModel,
} from '../models/conectividade.models';

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

export function classificarScoreMedio(score: number): ClassificacaoConectividadeModel {
  if (!Number.isFinite(score) || score <= 0) {
    return 'Inexistente';
  }

  if (score >= 13) {
    return 'Excelente';
  }

  if (score >= 9) {
    return 'Boa';
  }

  if (score >= 5) {
    return 'Média';
  }

  return 'Baixa';
}

export function corPorClassificacao(classificacao: ClassificacaoConectividadeModel): string {
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
    { municipio: string | null; sum: number; count: number; pibid_total: number }
  >();

  for (const ponto of pontos) {
    if (!ponto.municipio) continue;

    const chave = normalizarTexto(ponto.municipio);
    const atual = agrupados.get(chave) ?? {
      municipio: ponto.municipio,
      sum: 0,
      count: 0,
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
        pibid_total: item.pibid_total,
      };
    })
    .sort((a, b) => b.media_score - a.media_score);
}

export function mapGeoJsonMunicipiosComConectividade(
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
  const scores = resumos
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
        if (!filtrarMunicipios) return true;
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
          classificacao_conectividade_municipio: classificacao,
          cor,
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

export function mapPainelResponseToModel(api: PainelResponse): PainelConectividadeModel {
  const graficos: { [key: string]: GraficoModel } = Object.keys(api.data.graficos || {}).reduce(
    (acc, key) => {
      const g = api.data.graficos[key];
      acc[key] = { plotly: g.plotly, tipo: g.tipo, titulo: g.titulo };
      return acc;
    },
    {} as { [key: string]: GraficoModel },
  );

  return { descricao: api.descricao, graficos };
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
  api: AppSchemasConectividadeMapaResponse,
  geoMap: Map<number, EscolaGeoEntryModel>,
  filtros?: {
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  },
): MapaConectividadeModel {
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

    pontos.push({
      co_entidade: p.co_entidade,
      nome: geo.no_entidade,
      municipio: geo.no_municipio,
      latitude: geo.latitude,
      longitude: geo.longitude,
      no_tp_dependencia: geo.no_tp_dependencia ?? null,
      no_tp_localizacao: geo.no_tp_localizacao ?? null,
      score: p.score_conectividade,
      classificacao: p.classificacao_conectividade,
      pibid: numeroOuNulo(p.pibid),
      in_internet: numeroOuNulo(p.in_internet),
      in_internet_alunos: numeroOuNulo(p.in_internet_alunos),
      in_internet_administrativo: numeroOuNulo(p.in_internet_administrativo),
      in_internet_aprendizagem: numeroOuNulo(p.in_internet_aprendizagem),
      in_internet_comunidade: numeroOuNulo(p.in_internet_comunidade),
      in_banda_larga: numeroOuNulo(p.in_banda_larga),
      in_acesso_internet_computador: numeroOuNulo(p.in_acesso_internet_computador),
      in_aces_internet_disp_pessoais: numeroOuNulo(p.in_aces_internet_disp_pessoais),
      in_computador: numeroOuNulo(p.in_computador),
      in_desktop_aluno: numeroOuNulo(p.in_desktop_aluno),
      in_comp_portatil_aluno: numeroOuNulo(p.in_comp_portatil_aluno),
      in_tablet_aluno: numeroOuNulo(p.in_tablet_aluno),
      in_redes_sociais: numeroOuNulo(p.in_redes_sociais),
      tp_rede_local: numeroOuNulo(p.tp_rede_local),
      qt_desktop_aluno: numeroOuNulo(p.qt_desktop_aluno),
      qt_comp_portatil_aluno: numeroOuNulo(p.qt_comp_portatil_aluno),
      qt_tablet_aluno: numeroOuNulo(p.qt_tablet_aluno),
    });
  }

  return { descricao: api.descricao, pontos };
}

export function mapAnaliseTemporalResponseToModel(
  api: AppSchemasConectividadeAnaliseTemporalResponse,
): AnaliseTemporalModel {
  const graficos: { [key: string]: GraficoModel } = Object.keys(api.data.graficos || {}).reduce(
    (acc, key) => {
      const g = api.data.graficos[key];
      acc[key] = { plotly: g.plotly, tipo: g.tipo, titulo: g.titulo };
      return acc;
    },
    {} as { [key: string]: GraficoModel },
  );

  const listaGraficos: GraficoListaModel[] = Object.entries(graficos).map(([chave, grafico]) => ({
    chave,
    ...grafico,
  }));

  return { descricao: api.descricao, graficos, listaGraficos };
}
