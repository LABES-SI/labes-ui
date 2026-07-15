import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Accessibility,
  ArrowRight,
  LucideAngularModule,
  LucideIconData,
  School,
  Wifi,
} from 'lucide-angular';

export interface IndicadoresCardItem {
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly background: string;
  readonly icon: LucideIconData;
  readonly route?: string;
  readonly active: boolean;
}

const DEFAULT_INDICADORES: readonly IndicadoresCardItem[] = [
  {
    title: 'Acessibilidade',
    description:
      'Consulte dados sobre infraestrutura acessível, recursos de inclusão e condições de acesso nas escolas.',
    color: '#075be8',
    background: 'rgba(7, 91, 232, 0.12)',
    icon: Accessibility,
    route: '/indicadores/acessibilidade',
    active: true,
  },
  {
    title: 'Conectividade',
    description:
      'Consulte dados sobre acesso à internet, cobertura, e a infraestrutura de rede nas escolas públicas e privadas.',
    color: '#078f61',
    background: 'rgba(26, 163, 111, 0.14)',
    icon: Wifi,
    route: '/indicadores/conectividade',
    active: true,
  },
  {
    title: 'Infraestrutura',
    description:
      'Consulte dados sobre a infraestrutura das escolas, incluindo instalações físicas, recursos e equipamentos disponíveis.',
    color: '#7a3fd1',
    background: 'rgba(122, 63, 209, 0.13)',
    icon: School,
    route: '/indicadores/infraestrutura',
    active: true,
  },
];

@Component({
  selector: 'app-indicadores-cards',
  standalone: true,
  imports: [LucideAngularModule, NgTemplateOutlet, RouterLink],
  templateUrl: './indicadores-cards.component.html',
  styleUrl: './indicadores-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresCardsComponent {
  readonly arrowRightIcon = ArrowRight;

  readonly heading = input('Selecione um indicador para visualizar');
  readonly items = input<readonly IndicadoresCardItem[]>(DEFAULT_INDICADORES);
}
