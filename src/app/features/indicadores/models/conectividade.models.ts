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

export interface PainelConectividadeModel {
  descricao: string;
  graficos: { [key: string]: GraficoModel };
}

export type ClassificacaoConectividadeModel =
  | 'Boa'
  | 'Média'
  | 'Baixa'
  | 'Inexistente'
  | 'Conectada'
  | 'Parcial'
  | 'Sem Conectividade';

export interface MapaPontoModel {
  co_entidade: number;
  nome: string;
  municipio?: string | null;
  latitude: number;
  longitude: number;
  score: number;
  classificacao: ClassificacaoConectividadeModel;
  [key: string]: unknown;
}

export interface MapaConectividadeModel {
  descricao: string;
  pontos: MapaPontoModel[];
}

export interface AnaliseTemporalModel {
  descricao: string;
  graficos: { [key: string]: GraficoModel };
  listaGraficos: GraficoListaModel[];
}

export interface MapaMunicipioModel {
  codigo_municipio?: string | null;
  municipio: string | null;
  media_score: number;
  quantidade_escolas: number;
  classificacao: ClassificacaoConectividadeModel;
  cor: string;
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
  classificacao: ClassificacaoConectividadeModel;
  cor: string;
}

export interface MapaMunicipioGeoJsonPropertiesModel extends GeoJsonFeaturePropertiesModel {
  CD_MUN: string;
  NM_MUN: string;
  media_score: number;
  quantidade_escolas: number;
  classificacao_conectividade_municipio: ClassificacaoConectividadeModel;
  cor: string;
}

export interface MapaMunicipioGeoJsonModel extends GeoJsonFeatureModel {
  properties: MapaMunicipioGeoJsonPropertiesModel;
}

export interface MapaMunicipioGeoJsonCollectionModel {
  type: 'FeatureCollection';
  features: MapaMunicipioGeoJsonModel[];
}
