import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly links = [
    { label: 'Início', route: '/inicio', enabled: true },
    { label: 'Indicadores', route: null, enabled: false },
    { label: 'Escolas', route: null, enabled: false },
    { label: 'Comparações', route: null, enabled: false },
    { label: 'Publicações', route: null, enabled: false },
    { label: 'Sobre', route: '/sobre', enabled: true },
  ] as const;
}
