import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface GlossarioTermo {
  nome: string;
  categoria: string | { nome?: string; label?: string };
  definicao: string;
  exemplo?: string;
  linkInep?: string;
}

@Component({
  selector: 'app-glossario-termo-card',
  imports: [],
  templateUrl: './glossario-termo-card.html',
  styleUrl: './glossario-termo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlossarioTermoCard {
  readonly termo = input.required<GlossarioTermo>();

  getCategoriaLabel(): string {
    const cat = this.termo().categoria;
    if (typeof cat === 'string') {
      return cat;
    }
    return cat?.label || cat?.nome || '';
  }
}
