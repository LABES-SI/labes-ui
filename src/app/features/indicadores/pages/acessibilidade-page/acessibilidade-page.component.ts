import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MapPinned, School, TrendingUp } from 'lucide-angular';

import { IndicadoresHeroComponent } from '../../components/indicadores-hero/indicadores-hero.component';
import {
  IndicadoresCardItem,
  IndicadoresCardsComponent,
} from '../../components/indicadores-cards/indicadores-cards.component';

const PAINEIS_ACESSIBILIDADE: readonly IndicadoresCardItem[] = [
  {
    title: 'Visão Geral',
    description: 'Consulte o mapa municipal e os indicadores gerais de acessibilidade nas escolas.',
    color: '#075be8',
    background: 'rgba(7, 91, 232, 0.12)',
    icon: MapPinned,
    route: '/indicadores/acessibilidade/visao-geral',
    active: true,
  },
  {
    title: 'Análise Temporal',
    description: 'Acompanhe a evolução dos indicadores de acessibilidade ao longo dos anos.',
    color: '#078f61',
    background: 'rgba(26, 163, 111, 0.14)',
    icon: TrendingUp,
    route: '/indicadores/acessibilidade/analise-temporal',
    active: true,
  },
  {
    title: 'Escolas',
    description: 'Busque escolas por nome ou classificação e veja seus detalhes no mapa.',
    color: '#7a3fd1',
    background: 'rgba(122, 63, 209, 0.13)',
    icon: School,
    route: '/indicadores/acessibilidade/escolas',
    active: true,
  },
];

@Component({
  selector: 'app-acessibilidade-page',
  standalone: true,
  imports: [IndicadoresHeroComponent, IndicadoresCardsComponent],
  templateUrl: './acessibilidade-page.component.html',
  styleUrl: './acessibilidade-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcessibilidadePageComponent {
  protected readonly paineis = PAINEIS_ACESSIBILIDADE;
}
