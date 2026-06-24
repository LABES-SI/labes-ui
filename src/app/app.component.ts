import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { GlossarioDrawerComponent } from './features/glossario/components/glossario-drawer/glossario-drawer.component';
import { AppToastComponent } from './shared/ui/toast/app-toast.component';

@Component({
  selector: 'app-root',
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterOutlet,
    GlossarioDrawerComponent,
    AppToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
