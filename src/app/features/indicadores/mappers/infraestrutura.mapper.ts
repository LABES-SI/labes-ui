import { AppSchemasInfraestruturaAnaliseTemporalResponse } from '../../../core/api/models/app-schemas-infraestrutura-analise-temporal-response';
import { AppSchemasInfraestruturaMapaResponse } from '../../../core/api/models/app-schemas-infraestrutura-mapa-response';
import { FiltrosResponse } from '../../../core/api/models/filtros-response';
import { PainelResponse } from '../../../core/api/models/painel-response';
import {
  AnaliseTemporalModel,
  ClassificacaoInfraestruturaModel,
  DadosFiltrosModel,
  EscolaGeoEntryModel,
  GeoJsonFeatureCollectionModel,
  GraficoListaModel,
  GraficoModel,
  MapaInfraestruturaModel,
  MapaMunicipioGeoJsonCollectionModel,
  MapaMunicipioGeoJsonModel,
  MapaMunicipioGeoJsonPropertiesModel,
  MapaMunicipioResumoModel,
  MapaPontoModel,
  PainelInfraestruturaModel,
} from '../models/infraestrutura.models';

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

export function classificarScoreMedio(score: number): ClassificacaoInfraestruturaModel {
  if (!Number.isFinite(score) || score <= 0) {
    return 'Inexistente';
  }

  if (score >= 12) {
    return 'Boa';
  }

  if (score >= 7) {
    return 'Média';
  }

  return 'Baixa';
}

export function corPorClassificacao(classificacao: ClassificacaoInfraestruturaModel): string {
  switch (classificacao) {
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

export function mapGeoJsonMunicipiosComInfraestrutura(
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
          classificacao_infraestrutura_municipio: classificacao,
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

export function mapPainelResponseToModel(api: PainelResponse): PainelInfraestruturaModel {
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

export function mapMapaResponseToModel(
  api: AppSchemasInfraestruturaMapaResponse,
  geoMap: Map<number, EscolaGeoEntryModel>,
  filtros?: {
    municipios?: string[] | null;
    rede_ensino?: string[] | null;
    tp_localizacao?: string[] | null;
  },
): MapaInfraestruturaModel {
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
      score: p.score_infraestrutura,
      classificacao: p.classificacao_infraestrutura,
      pibid: numeroOuNulo(p.pibid),
      in_agua_potavel: numeroOuNulo(p.in_agua_potavel),
      in_energia_rede_publica: numeroOuNulo(p.in_energia_rede_publica),
      in_esgoto_rede_publica: numeroOuNulo(p.in_esgoto_rede_publica),
      in_lixo_servico_coleta: numeroOuNulo(p.in_lixo_servico_coleta),
      in_banheiro: numeroOuNulo(p.in_banheiro),
      in_banheiro_pne: numeroOuNulo(p.in_banheiro_pne),
      in_biblioteca: numeroOuNulo(p.in_biblioteca),
      in_sala_leitura: numeroOuNulo(p.in_sala_leitura),
      in_laboratorio_ciencias: numeroOuNulo(p.in_laboratorio_ciencias),
      in_laboratorio_informatica: numeroOuNulo(p.in_laboratorio_informatica),
      in_sala_multiuso: numeroOuNulo(p.in_sala_multiuso),
      in_sala_atendimento_especial: numeroOuNulo(p.in_sala_atendimento_especial),
      in_cozinha: numeroOuNulo(p.in_cozinha),
      in_refeitorio: numeroOuNulo(p.in_refeitorio),
      in_quadra_esportes: numeroOuNulo(p.in_quadra_esportes),
      in_patio_coberto: numeroOuNulo(p.in_patio_coberto),
      in_auditorio: numeroOuNulo(p.in_auditorio),
    });
  }

  return { descricao: api.descricao, pontos };
}

export function mapAnaliseTemporalResponseToModel(
  api: AppSchemasInfraestruturaAnaliseTemporalResponse,
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
