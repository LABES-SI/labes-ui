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
    { label: 'Início', route: '/inicio', exact: true },
    { label: 'Dashboard', route: '/dashboards/acessibilidade', exact: false },
    { label: 'Colaboradores', route: '/colaboradores', exact: true },
    { label: 'Sobre', route: '/sobre', exact: true },
  ] as const;
}
