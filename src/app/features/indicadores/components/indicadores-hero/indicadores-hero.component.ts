import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-indicadores-hero',
  standalone: true,
  templateUrl: './indicadores-hero.component.html',
  styleUrl: './indicadores-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadoresHeroComponent {}
