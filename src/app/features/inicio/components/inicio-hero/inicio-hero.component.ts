import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppButtonComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-inicio-hero',
  standalone: true,
  imports: [AppButtonComponent],
  templateUrl: './inicio-hero.component.html',
  styleUrl: './inicio-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioHeroComponent {}
