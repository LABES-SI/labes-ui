import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-grafico-card',
  standalone: true,
  templateUrl: './grafico-card.component.html',
  styleUrl: './grafico-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoCardComponent {
  readonly titulo = input.required<string>();
  readonly descricao = input<string>('Área reservada para gráfico.');
}
