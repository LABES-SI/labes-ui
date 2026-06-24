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
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GlossarioFacade } from '../../facades/glossario.facade';
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
  private readonly facade = inject(GlossarioFacade);
  private renderer = inject(Renderer2);

  readonly isOpen = signal(false);
  readonly searchTerm = signal('');
  readonly selectedCategory = signal<CategoriaFiltro>('todos');

  readonly termos = toSignal(this.facade.listarTodos(), { initialValue: [] as TermoGlossario[] });

  readonly categories: CategoriaPill[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'desempenho', label: 'Desempenho' },
    { id: 'fluxo', label: 'Fluxo' },
    { id: 'infraestrutura', label: 'Infraestrutura' },
  ];

  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
        setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
      } else {
        this.renderer.removeStyle(document.body, 'overflow');
      }
    });
  }

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

  toggleDrawer(): void {
    this.isOpen.update((v) => !v);
  }

  closeDrawer(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.searchTerm.set('');
    }
  }

  selectCategory(category: CategoriaFiltro): void {
    this.selectedCategory.set(category);
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDrawer();
  }
}
