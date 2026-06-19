import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  signal,
  viewChild,
  effect,
  Renderer2,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GLOSSARIO_MOCK } from '../../data/glossario';
import { CategoriaGlossario, TermoGlossario } from '../../models/glossario.models';
import { GlossarioTermoCard } from '../glossario-termo-card/glossario-termo-card';

type CategoriaFiltro = CategoriaGlossario | 'todos';

interface CategoriaPill {
  id: CategoriaFiltro;
  label: string;
}

@Component({
  selector: 'app-glossario-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, GlossarioTermoCard],
  templateUrl: './glossario-drawer.component.html',
  styleUrl: './glossario-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlossarioDrawerComponent {
  private renderer = inject(Renderer2);

  // Estados principais
  readonly isOpen = signal(false);
  readonly searchTerm = signal('');
  readonly selectedCategory = signal<CategoriaFiltro>('todos');

  // Fonte de dados (poderia vir de um serviço, mas o mock está disponível)
  readonly termos = signal<TermoGlossario[]>(GLOSSARIO_MOCK);

  // Configuração das Pills (Filtros)
  readonly categories: CategoriaPill[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'desempenho', label: 'Desempenho' },
    { id: 'fluxo', label: 'Fluxo' },
    { id: 'infraestrutura', label: 'Infraestrutura' },
  ];

  // ViewChild para auto-focus no input de busca ao abrir
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    // Efeito para travar o scroll da página quando o modal estiver aberto
    effect(() => {
      if (this.isOpen()) {
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
        // Usar setTimeout para garantir que o elemento já foi renderizado pelo @if
        setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
      } else {
        this.renderer.removeStyle(document.body, 'overflow');
      }
    });
  }

  // Lógica Reativa de Filtragem Cruzada
  readonly filteredTerms = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();
    const allTerms = this.termos();

    return allTerms.filter((termo) => {
      const matchSearch =
        termo.termo.toLowerCase().includes(search) ||
        termo.definicao.toLowerCase().includes(search);
      const matchCategory = category === 'todos' || termo.categoria === category;
      return matchSearch && matchCategory;
    });
  });

  // Ações da Interface
  toggleDrawer(): void {
    this.isOpen.update((v) => !v);
  }

  closeDrawer(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.searchTerm.set(''); // Limpa a busca ao fechar (opcional, dependendo da UX desejada)
    }
  }

  selectCategory(category: CategoriaFiltro): void {
    this.selectedCategory.set(category);
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  // Acessibilidade: fechar com ESC
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDrawer();
  }
}
