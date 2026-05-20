import { ChangeDetectionStrategy, Component } from '@angular/core';

import { InicioHeroComponent } from '../../components/inicio-hero/inicio-hero.component';
import { InicioIndicadoresComponent } from '../../components/inicio-indicadores/inicio-indicadores.component';
import { InicioSobreComponent } from '../../components/inicio-sobre/inicio-sobre.component';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [InicioHeroComponent, InicioSobreComponent, InicioIndicadoresComponent],
  templateUrl: './inicio-page.component.html',
  styleUrl: './inicio-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioPageComponent {}
