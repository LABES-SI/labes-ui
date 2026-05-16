import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-painel-filtros',
  standalone: true,
  templateUrl: './painel-filtros.component.html',
  styleUrl: './painel-filtros.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelFiltrosComponent {
  readonly consultar = output<void>();
}
