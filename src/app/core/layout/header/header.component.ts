import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly menuAberto = signal(false);

  protected readonly links = [
    { label: 'Início', route: '/inicio', exact: true },
    { label: 'Indicadores', route: '/indicadores', exact: false },
    { label: 'Colaboradores', route: '/colaboradores', exact: true },
    { label: 'Sobre', route: '/sobre', exact: true },
  ] as const;

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }
}
