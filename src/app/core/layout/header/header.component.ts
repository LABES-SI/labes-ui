import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly menuAberto = signal(false);

  protected readonly links = [
    { label: 'Início', route: '/inicio', exact: true },
    { label: 'Indicadores', route: '/indicadores', exact: false },
    { label: 'Colaboradores', route: '/colaboradores', exact: true },
    { label: 'Sobre', route: '/sobre', exact: true },
  ] as const;

  constructor() {
    // O header é fixed e sua altura varia com o conteúdo (quebra de texto,
    // largura da janela). Mede a altura real e expõe via CSS var para o
    // app-main reservar espaço suficiente e nunca ficar sobreposto por ele.
    afterNextRender(() => {
      const headerInner = this.elementRef.nativeElement.querySelector('.header-inner');
      if (!headerInner) return;

      const atualizarAlturaReservada = () => {
        const altura = headerInner.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--sie-header-offset', `${altura + 32}px`);
      };

      atualizarAlturaReservada();

      const observer = new ResizeObserver(atualizarAlturaReservada);
      observer.observe(headerInner);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }
}
