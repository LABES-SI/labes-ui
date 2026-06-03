import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AreaColaboradores } from '../../models/colaboradores.models';
import { ColaboradorCard } from '../colaborador-card/colaborador-card';

@Component({
  selector: 'app-colaboradores-area',
  imports: [ColaboradorCard],
  templateUrl: './colaboradores-area.html',
  styleUrl: './colaboradores-area.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradoresArea {
  readonly area = input.required<AreaColaboradores>();
}
