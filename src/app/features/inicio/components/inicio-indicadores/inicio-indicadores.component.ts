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
} from 'lucide-angular';

import { AppButtonComponent } from '../../../../shared/ui';

interface IndicadorInicio {
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly background: string;
  readonly icon: LucideIconData;
  readonly route?: string;
  readonly active: boolean;
}

@Component({
  selector: 'app-inicio-indicadores',
  standalone: true,
  imports: [AppButtonComponent, LucideAngularModule, NgTemplateOutlet, RouterLink],
  templateUrl: './inicio-indicadores.component.html',
  styleUrl: './inicio-indicadores.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioIndicadoresComponent {
  readonly arrowRightIcon = ArrowRight;

  readonly indicadores: readonly IndicadorInicio[] = [
    {
      title: 'Acessibilidade',
      description:
        'Consulte dados sobre infraestrutura acessivel, recursos de inclusao e condicoes de acesso nas escolas.',
      color: '#075be8',
      background: 'rgba(7, 91, 232, 0.12)',
      icon: Accessibility,
      route: '/indicadores/acessibilidade',
      active: true,
    },
    {
      title: 'Desempenho Educacional',
      description:
        'Acompanhe os resultados de aprendizagem dos estudantes paraenses em avaliacoes internas e externas.',
      color: '#078f61',
      background: 'rgba(26, 163, 111, 0.14)',
      icon: GraduationCap,
      active: false,
    },
    {
      title: 'Escolas',
      description:
        'Explore informacoes sobre escolas da rede publica e privada: infraestrutura, matriculas, IDEB e muito mais.',
      color: '#7a3fd1',
      background: 'rgba(122, 63, 209, 0.13)',
      icon: School,
      active: false,
    },
    {
      title: 'Profissionais da Educacao',
      description:
        'Dados sobre docentes, gestores e demais profissionais que atuam na educacao basica do Para.',
      color: '#d48600',
      background: 'rgba(244, 161, 25, 0.16)',
      icon: UsersRound,
      active: false,
    },
    {
      title: 'Financiamento',
      description:
        'Informacoes sobre investimentos na educacao publica do Para e execucao orcamentaria.',
      color: '#087f9c',
      background: 'rgba(8, 127, 156, 0.13)',
      icon: Banknote,
      active: false,
    },
    {
      title: 'Territorios',
      description:
        'Compare indicadores educacionais entre municipios, regioes de integracao e redes de ensino.',
      color: '#dd4d82',
      background: 'rgba(221, 77, 130, 0.13)',
      icon: MapPinned,
      active: false,
    },
  ];
}
