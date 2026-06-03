import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Colaborador } from '../../models/colaboradores.models';

@Component({
  selector: 'app-colaborador-card',
  imports: [],
  templateUrl: './colaborador-card.html',
  styleUrl: './colaborador-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradorCard {
  readonly colaborador = input.required<Colaborador>();
  readonly destaque = input(false);
}
