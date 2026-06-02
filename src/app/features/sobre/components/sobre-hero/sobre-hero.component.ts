import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sobre-hero',
  standalone: true,
  templateUrl: './sobre-hero.component.html',
  styleUrl: './sobre-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SobreHeroComponent {}
