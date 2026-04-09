import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FeatureCardComponent } from '../../../../shared/ui/feature-card/feature-card.component';

@Component({
  selector: 'app-home-page',
  imports: [FeatureCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  protected readonly pillars = [
    {
      eyebrow: 'core',
      title: 'Camada central',
      description: 'Layouts, providers globais e peças que sustentam toda a aplicação.',
    },
    {
      eyebrow: 'shared',
      title: 'Componentes compartilhados',
      description: 'UI reutilizável, regras comuns e utilitários sem acoplamento a uma feature.',
    },
    {
      eyebrow: 'features',
      title: 'Módulos de negócio',
      description: 'Cada domínio cresce isolado, com rotas lazy e responsabilidade bem definida.',
    },
  ] as const;

  protected readonly nextSteps = [
    'Criar uma feature nova em src/app/features/<nome>',
    'Extrair UI reaproveitável para src/app/shared/ui',
    'Manter providers e layout global em src/app/core',
  ] as const;
}
