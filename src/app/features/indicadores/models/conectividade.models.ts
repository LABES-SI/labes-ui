import type { PlotlyFigure } from '../../../core/api/models/plotly-figure';
import type { Paginacao } from '../../../core/api/models/paginacao';

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

export interface PainelConectividadeModel {
  descricao: string;
  graficos: { [key: string]: GraficoModel };
}

export interface PainelEscolasModel {
  grafico: GraficoModel;
  paginacao: Paginacao;
}

export type ClassificacaoConectividadeModel =
  | 'Excelente'
  | 'Boa'
  | 'Média'
  | 'Baixa'
  | 'Inexistente';

export interface MapaPontoModel {
  co_entidade: number;
  nome: string;
  municipio?: string | null;
  latitude: number;
  longitude: number;
  score: number;
  classificacao: ClassificacaoConectividadeModel;
  no_bairro?: string | null;
  no_tp_dependencia?: string | null;
  no_tp_localizacao?: string | null;
  pibid?: number | null;
  in_internet?: number | null;
  in_internet_alunos?: number | null;
  in_internet_administrativo?: number | null;
  in_internet_aprendizagem?: number | null;
  in_internet_comunidade?: number | null;
  in_banda_larga?: number | null;
  in_acesso_internet_computador?: number | null;
  in_aces_internet_disp_pessoais?: number | null;
  in_computador?: number | null;
  in_desktop_aluno?: number | null;
  in_comp_portatil_aluno?: number | null;
  in_tablet_aluno?: number | null;
  in_redes_sociais?: number | null;
  tp_rede_local?: number | null;
  qt_desktop_aluno?: number | null;
  qt_comp_portatil_aluno?: number | null;
  qt_tablet_aluno?: number | null;
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
  pibid_total?: number | null;
}

export interface MapaMunicipioGeoJsonPropertiesModel extends GeoJsonFeaturePropertiesModel {
  CD_MUN: string;
  NM_MUN: string;
  media_score: number;
  quantidade_escolas: number;
  classificacao_conectividade_municipio: ClassificacaoConectividadeModel;
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
