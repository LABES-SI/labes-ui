import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-indicador-card',
  standalone: true,
  templateUrl: './indicador-card.component.html',
  styleUrl: './indicador-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicadorCardComponent {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly descricao = input<string>();
}
