import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ArrowRight,
  BarChart3,
  FileCheck2,
  LucideAngularModule,
  MapPinned,
  Target,
  Users,
} from 'lucide-angular';

import { AppButtonComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-inicio-sobre',
  standalone: true,
  imports: [AppButtonComponent, LucideAngularModule],
  templateUrl: './inicio-sobre.component.html',
  styleUrl: './inicio-sobre.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioSobreComponent {
  readonly arrowRightIcon = ArrowRight;
  readonly commitmentIcon = FileCheck2;
  readonly stats = `{"escolas": 5000, "alunos": 200000, "professores": 15000}`;

  readonly highlights = [
    {
      icon: BarChart3,
      tone: 'green',
      title: 'Dados para transformar',
      text: 'Indicadores atualizados e confi&aacute;veis sobre aprendizagem, fluxo escolar, infraestrutura, docentes e muito mais.',
    },
    {
      icon: MapPinned,
      tone: 'blue',
      title: 'Vis&atilde;o territorial',
      text: 'Informa&ccedil;&otilde;es que permitem analisar desigualdades e avan&ccedil;os em todos os munic&iacute;pios paraenses.',
    },
    {
      icon: Users,
      tone: 'purple',
      title: 'Transpar&ecirc;ncia e acesso',
      text: 'Dados abertos e acess&iacute;veis para promover a transpar&ecirc;ncia e o controle social.',
    },
    {
      icon: Target,
      tone: 'amber',
      title: 'Apoio &agrave; decis&atilde;o',
      text: 'Ferramentas que auxiliam na formula&ccedil;&atilde;o, monitoramento e avalia&ccedil;&atilde;o de pol&iacute;ticas p&uacute;blicas educacionais.',
    },
  ];
}
