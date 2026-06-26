import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Accessibility,
  ArrowRight,
  Banknote,
  GraduationCap,
  LucideAngularModule,
  LucideIconData,
  MapPinned,
  School,
  UsersRound,
  Wifi,
} from 'lucide-angular';

interface IndicadoresCardItem {
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly background: string;
  readonly icon: LucideIconData;
  readonly route?: string;
  readonly active: boolean;
}

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

  readonly indicadores: readonly IndicadoresCardItem[] = [
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
      color: '#e85c07',
      background: 'rgba(232, 92, 7, 0.12)',
      icon: Wifi,
      route: '/indicadores/conectividade',
      active: true,
    },
    {
      title: 'Desempenho Educacional',
      description:
        'Acompanhe os resultados de aprendizagem dos estudantes paraenses em avaliações internas e externas.',
      color: '#078f61',
      background: 'rgba(26, 163, 111, 0.14)',
      icon: GraduationCap,
      active: false,
    },
    {
      title: 'Escolas',
      description:
        'Explore informações sobre escolas da rede pública e privada: infraestrutura, matrículas, IDEB e muito mais.',
      color: '#7a3fd1',
      background: 'rgba(122, 63, 209, 0.13)',
      icon: School,
      active: false,
    },
    {
      title: 'Profissionais da Educação',
      description:
        'Dados sobre docentes, gestores e demais profissionais que atuam na educação básica do Pará.',
      color: '#d48600',
      background: 'rgba(244, 161, 25, 0.16)',
      icon: UsersRound,
      active: false,
    },
    {
      title: 'Financiamento',
      description:
        'Informações sobre investimentos na educação pública do Pará e execução orçamentária.',
      color: '#087f9c',
      background: 'rgba(8, 127, 156, 0.13)',
      icon: Banknote,
      active: false,
    },
    {
      title: 'Territórios',
      description:
        'Compare indicadores educacionais entre municípios, regiões de integração e redes de ensino.',
      color: '#dd4d82',
      background: 'rgba(221, 77, 130, 0.13)',
      icon: MapPinned,
      active: false,
    },
  ];
}
