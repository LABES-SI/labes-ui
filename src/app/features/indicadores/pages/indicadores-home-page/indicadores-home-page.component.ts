import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IndicadoresHeroComponent } from '../../components/indicadores-hero/indicadores-hero.component';
import { IndicadoresCardsComponent } from '../../components/indicadores-cards/indicadores-cards.component';

@Component({
  selector: 'app-indicadores-home-page',
  standalone: true,
  imports: [IndicadoresHeroComponent, IndicadoresCardsComponent],
  templateUrl: './indicadores-home-page.component.html',
  styleUrl: './indicadores-home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresHomePageComponent {}
