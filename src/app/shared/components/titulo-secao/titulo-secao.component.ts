import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-titulo-secao',
  standalone: true,
  templateUrl: './titulo-secao.component.html',
  styleUrl: './titulo-secao.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TituloSecaoComponent {
  readonly titulo = input.required<string>();
  readonly descricao = input<string>();
}
