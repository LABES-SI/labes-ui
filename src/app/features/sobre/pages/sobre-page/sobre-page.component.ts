import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SobreHeroComponent } from '../../components/sobre-hero/sobre-hero.component';
import { SobreOQueEComponent } from '../../components/sobre-o-que-e/sobre-o-que-e.component';
import { FontesDadosComponent } from '../../components/fontes-dados/fontes-dados.component';

@Component({
  selector: 'app-sobre-page',
  standalone: true,
  imports: [SobreHeroComponent, SobreOQueEComponent, FontesDadosComponent],
  templateUrl: './sobre-page.component.html',
  styleUrl: './sobre-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SobrePageComponent {}
