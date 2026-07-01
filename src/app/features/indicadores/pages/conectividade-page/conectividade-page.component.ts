import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MapPinned, School, TrendingUp } from 'lucide-angular';

import { IndicadoresHeroComponent } from '../../components/indicadores-hero/indicadores-hero.component';
import {
  IndicadoresCardItem,
  IndicadoresCardsComponent,
} from '../../components/indicadores-cards/indicadores-cards.component';

const PAINEIS_CONECTIVIDADE: readonly IndicadoresCardItem[] = [
  {
    title: 'Visão Geral',
    description: 'Consulte o mapa municipal e os indicadores gerais de conectividade nas escolas.',
    color: '#078f61',
    background: 'rgba(26, 163, 111, 0.14)',
    icon: MapPinned,
    route: '/indicadores/conectividade/visao-geral',
    active: true,
  },
  {
    title: 'Análise Temporal',
    description: 'Acompanhe a evolução dos indicadores de conectividade ao longo dos anos.',
    color: '#075be8',
    background: 'rgba(7, 91, 232, 0.12)',
    icon: TrendingUp,
    route: '/indicadores/conectividade/analise-temporal',
    active: true,
  },
  {
    title: 'Escolas',
    description: 'Busque escolas por nome ou classificação e veja seus detalhes no mapa.',
    color: '#7a3fd1',
    background: 'rgba(122, 63, 209, 0.13)',
    icon: School,
    route: '/indicadores/conectividade/escolas',
    active: true,
  },
];

@Component({
  selector: 'app-conectividade-page',
  standalone: true,
  imports: [IndicadoresHeroComponent, IndicadoresCardsComponent],
  templateUrl: './conectividade-page.component.html',
  styleUrl: './conectividade-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConectividadePageComponent {
  protected readonly paineis = PAINEIS_CONECTIVIDADE;
}
