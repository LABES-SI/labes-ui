import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-indicadores-hero',
  standalone: true,
  templateUrl: './indicadores-hero.component.html',
  styleUrl: './indicadores-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresHeroComponent {
  readonly eyebrow = input('Indicadores');
  readonly title = input('Conheça os indicadores');
  readonly description = input('Explore indicadores organizados em painéis temáticos do SIE.');
}
