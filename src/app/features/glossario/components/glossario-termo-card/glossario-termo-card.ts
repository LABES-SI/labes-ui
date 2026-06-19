import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermoGlossario } from '../../models/glossario.models';

@Component({
  selector: 'app-glossario-termo-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glossario-termo-card.html',
  styleUrl: './glossario-termo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlossarioTermoCard {
  // Recebe o termo utilizando a tipagem oficial do Card 18 via Signal Input
  readonly termo = input.required<TermoGlossario>();

  /**
   * Retorna o texto formatado e amigável da categoria para exibição na badge.
   */
  getCategoriaLabel(): string {
    const labels: Record<TermoGlossario['categoria'], string> = {
      desempenho: 'Desempenho',
      fluxo: 'Fluxo',
      infraestrutura: 'Infraestrutura',
    };

    return labels[this.termo().categoria];
  }
}
