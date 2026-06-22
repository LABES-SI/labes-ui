import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AreaColaboradores, Colaborador } from '../../models/colaboradores.models';
import { ColaboradoresArea } from '../colaboradores-area/colaboradores-area';
import { ColaboradorCard } from '../colaborador-card/colaborador-card';

@Component({
  selector: 'app-colaboradores-lista',
  imports: [ColaboradoresArea, ColaboradorCard],
  templateUrl: './colaboradores-lista.html',
  styleUrl: './colaboradores-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradoresLista {
  readonly orientador = input.required<Colaborador>();
  readonly areasColaboradores = input.required<AreaColaboradores[]>();
}
