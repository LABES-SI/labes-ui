import type { PlotlyFigure } from '../../../core/api/models/plotly-figure';

export interface MetricaFiltroModel {
  chave: string;
  label: string;
}

export interface MunicipioFiltroModel {
  codigo: number;
  nome: string;
}

export interface DadosFiltrosModel {
  anos: number[];
  metricas: MetricaFiltroModel[];
  municipios: MunicipioFiltroModel[];
  rede_ensino?: string[];
  tp_localizacao?: string[];
}

export interface EscolaGeoEntryModel {
  co_entidade: number;
  no_entidade: string;
  no_bairro?: string | null;
  latitude: number;
  longitude: number;
  no_municipio: string | null;
  no_tp_dependencia?: string | null;
  no_tp_localizacao?: string | null;
}

export interface GraficoModel {
  plotly: PlotlyFigure;
  tipo: string;
  titulo: string;
  [key: string]: unknown;
}

export interface GraficoListaModel extends GraficoModel {
  chave: string;
}

export interface PainelInfraestruturaModel {
  descricao: string;
  graficos: { [key: string]: GraficoModel };
}

export type ClassificacaoInfraestruturaModel = 'Boa' | 'Média' | 'Baixa' | 'Inexistente';

export interface MapaPontoModel {
  co_entidade: number;
  nome: string;
  municipio?: string | null;
  latitude: number;
  longitude: number;
  score: number;
  classificacao: ClassificacaoInfraestruturaModel;
  no_bairro?: string | null;
  no_tp_dependencia?: string | null;
  no_tp_localizacao?: string | null;
  pibid?: number | null;
  in_agua_potavel?: number | null;
  in_energia_rede_publica?: number | null;
  in_esgoto_rede_publica?: number | null;
  in_lixo_servico_coleta?: number | null;
  in_banheiro?: number | null;
  in_banheiro_pne?: number | null;
  in_biblioteca?: number | null;
  in_sala_leitura?: number | null;
  in_laboratorio_ciencias?: number | null;
  in_laboratorio_informatica?: number | null;
  in_sala_multiuso?: number | null;
  in_sala_atendimento_especial?: number | null;
  in_cozinha?: number | null;
  in_refeitorio?: number | null;
  in_quadra_esportes?: number | null;
  in_patio_coberto?: number | null;
  in_auditorio?: number | null;
  [key: string]: unknown;
}

export interface MapaInfraestruturaModel {
  descricao: string;
  pontos: MapaPontoModel[];
}

export interface AnaliseTemporalModel {
  descricao: string;
  graficos: { [key: string]: GraficoModel };
  listaGraficos: GraficoListaModel[];
}

export interface GeoJsonGeometryModel {
  type: string;
  coordinates: unknown;
}

export interface GeoJsonFeaturePropertiesModel {
  [key: string]: unknown;
}

export interface GeoJsonFeatureModel {
  type: 'Feature';
  geometry: GeoJsonGeometryModel;
  properties: GeoJsonFeaturePropertiesModel;
}

export interface GeoJsonFeatureCollectionModel {
  type: 'FeatureCollection';
  features: GeoJsonFeatureModel[];
}

export interface MapaMunicipioResumoModel {
  municipio: string | null;
  media_score: number;
  quantidade_escolas: number;
  classificacao: ClassificacaoInfraestruturaModel;
  cor: string;
  pibid_total?: number | null;
}

export interface MapaMunicipioGeoJsonPropertiesModel extends GeoJsonFeaturePropertiesModel {
  CD_MUN: string;
  NM_MUN: string;
  media_score: number;
  quantidade_escolas: number;
  classificacao_infraestrutura_municipio: ClassificacaoInfraestruturaModel;
  cor: string;
  pibid_total?: number | null;
}

export interface MapaMunicipioGeoJsonModel extends GeoJsonFeatureModel {
  properties: MapaMunicipioGeoJsonPropertiesModel;
}

export interface MapaMunicipioGeoJsonCollectionModel {
  type: 'FeatureCollection';
  features: MapaMunicipioGeoJsonModel[];
}
