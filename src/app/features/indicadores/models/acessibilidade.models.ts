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
  rede_ensino?: Array<'Federal' | 'Estadual' | 'Municipal' | 'Privada'>;
  tp_localizacao?: Array<'Urbana' | 'Rural'>;
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

export interface PainelAcessibilidadeModel {
  descricao: string;
  dadosFiltros: DadosFiltrosModel;
  graficos: { [key: string]: GraficoModel };
}

export interface MapaPontoModel {
  co_entidade: number;
  nome: string;
  municipio?: string | null;
  latitude: number;
  longitude: number;
  score: number;
  classificacao: ClassificacaoAcessibilidadeModel;
  no_bairro?: string | null;
  no_tp_dependencia?: string | null;
  no_tp_localizacao?: string | null;
  [key: string]: unknown;
}

export interface MapaAcessibilidadeModel {
  descricao: string;
  pontos: MapaPontoModel[];
}

export interface AnaliseTemporalModel {
  descricao: string;
  dadosFiltros: { metricas: MetricaFiltroModel[] };
  graficos: { [key: string]: GraficoModel };
  listaGraficos: GraficoListaModel[];
}

export interface MapaMunicipioModel {
  codigo_municipio?: string | null;
  municipio: string | null;
  media_score: number;
  quantidade_escolas: number;
  classificacao: ClassificacaoAcessibilidadeModel;
  cor: string;
}

export type ClassificacaoAcessibilidadeModel = 'Boa' | 'Média' | 'Baixa' | 'Inexistente';

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
  classificacao: ClassificacaoAcessibilidadeModel;
  cor: string;
}

export interface MapaMunicipioGeoJsonPropertiesModel extends GeoJsonFeaturePropertiesModel {
  CD_MUN: string;
  NM_MUN: string;
  media_score: number;
  quantidade_escolas: number;
  classificacao_acessibilidade_municipio: ClassificacaoAcessibilidadeModel;
  cor: string;
}

export interface MapaMunicipioGeoJsonModel extends GeoJsonFeatureModel {
  properties: MapaMunicipioGeoJsonPropertiesModel;
}

export interface MapaMunicipioGeoJsonCollectionModel {
  type: 'FeatureCollection';
  features: MapaMunicipioGeoJsonModel[];
}
