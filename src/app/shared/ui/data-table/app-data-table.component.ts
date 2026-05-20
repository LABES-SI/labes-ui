import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AppTagComponent } from '../tag/app-tag.component';
import {
  AppTableCellContext,
  AppTableColumn,
  AppTableRowAction,
  AppTableRowActionEvent,
  AppTableSortOrder,
  AppTableSortValue,
} from './app-data-table.types';

interface AppTableActiveSort {
  field: string;
  order: AppTableSortOrder;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    TableModule,
    TooltipModule,
    LucideAngularModule,
    AppTagComponent,
  ],
  template: `
    <p-table
      [value]="primeItems()"
      [columns]="primeColumns()"
      [loading]="loading()"
      [paginator]="paginator()"
      [rows]="rows()"
      [stripedRows]="striped()"
      [showGridlines]="showGridlines()"
      [rowHover]="true"
      [tableStyle]="{ 'min-width': minWidth() }"
    >
      @if (title()) {
        <ng-template pTemplate="caption">
          <div class="text-base font-semibold text-slate-900">
            {{ title() }}
          </div>
        </ng-template>
      }

      <ng-template pTemplate="header" let-columns>
        <tr>
          @for (column of columns; track getColumnKey(column)) {
            <th
              [style.width]="column.width"
              [style.text-align]="column.align ?? 'left'"
              [class.cursor-pointer]="isColumnSortable(column)"
              [class.select-none]="isColumnSortable(column)"
              [attr.aria-sort]="getAriaSort(column)"
              (click)="toggleSort(column)"
            >
              <span
                class="inline-flex items-center gap-1"
                [class.justify-center]="column.align === 'center'"
                [class.justify-end]="column.align === 'right'"
              >
                {{ column.header }}

                @if (isColumnSortable(column)) {
                  <span class="text-xs text-slate-400" aria-hidden="true">
                    {{ getSortIcon(column) }}
                  </span>
                }
              </span>
            </th>
          }

          @if (rowActions().length > 0) {
            <th class="text-center">
              {{ rowActionsHeader() }}
            </th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-item let-columns="columns">
        <tr>
          @for (column of columns; track getColumnKey(column)) {
            <td [style.text-align]="column.align ?? 'left'">
              @if (cellTemplate(); as template) {
                <ng-container *ngTemplateOutlet="template; context: getCellContext(item, column)" />
              } @else if (column.type === 'status') {
                <app-tag
                  [label]="formatCellValue(getCellValue(item, column))"
                  [status]="getStatus(item, column)"
                />
              } @else {
                {{ formatCellValue(getCellValue(item, column)) }}
              }
            </td>
          }

          @if (rowActions().length > 0) {
            <td class="text-center">
              <div class="flex items-center justify-center gap-2">
                @for (action of rowActions(); track action.id) {
                  @if (isActionVisible(action, item)) {
                    <button
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      [ngClass]="getActionClasses(action)"
                      type="button"
                      [attr.aria-label]="getActionAriaLabel(action)"
                      [pTooltip]="getActionTooltip(action)"
                      tooltipPosition="top"
                      [disabled]="isActionDisabled(action, item)"
                      (click)="onRowAction(action, item)"
                    >
                      @if (action.icon) {
                        <lucide-icon class="h-4 w-4" [img]="action.icon" />
                      } @else {
                        <span class="text-xs font-medium">{{ action.label }}</span>
                      }
                    </button>
                  }
                }
              </div>
            </td>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td class="app-table-empty" [attr.colspan]="emptyColspan()">
            {{ emptyMessage() }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDataTableComponent<T extends object = Record<string, unknown>> {
  readonly cellTemplate = contentChild<TemplateRef<AppTableCellContext<T>>>('cell');

  readonly items = input<readonly T[]>([]);
  readonly columns = input<readonly AppTableColumn<T>[]>([]);
  readonly rowActions = input<readonly AppTableRowAction<T>[]>([]);

  readonly title = input('');
  readonly rowActionsHeader = input('Ações');
  readonly loading = input(false);
  readonly paginator = input(false);
  readonly rows = input(10);
  readonly striped = input(false);
  readonly showGridlines = input(false);
  readonly minWidth = input('40rem');
  readonly emptyMessage = input('Nenhum registro encontrado.');

  readonly rowAction = output<AppTableRowActionEvent<T>>();

  private readonly activeSort = signal<AppTableActiveSort | null>(null);

  readonly primeColumns = computed(() => [...this.columns()]);

  readonly primeItems = computed(() => {
    const items = [...this.items()];
    const sort = this.activeSort();

    if (!sort) {
      return items;
    }

    const column = this.columns().find((column) => this.getColumnKey(column) === sort.field);

    if (!column) {
      return items;
    }

    return items.sort((a, b) => {
      const result = this.compareValues(this.getSortValue(a, column), this.getSortValue(b, column));

      return sort.order === 'asc' ? result : -result;
    });
  });

  readonly emptyColspan = computed(() => {
    return Math.max(this.columns().length + (this.rowActions().length > 0 ? 1 : 0), 1);
  });

  getColumnKey(column: AppTableColumn<T>): string {
    return column.id ?? column.field;
  }

  getCellValue(item: T, column: AppTableColumn<T>): unknown {
    if (column.value) {
      return column.value(item);
    }

    return (item as Record<string, unknown>)[column.field];
  }

  formatCellValue(value: unknown): string {
    return value == null || value === '' ? '-' : String(value);
  }

  getStatus(item: T, column: AppTableColumn<T>) {
    return column.status?.(item) ?? 'neutral';
  }

  isColumnSortable(column: AppTableColumn<T>): boolean {
    return column.sortable !== false;
  }

  toggleSort(column: AppTableColumn<T>): void {
    if (!this.isColumnSortable(column)) {
      return;
    }

    const field = this.getColumnKey(column);
    const currentSort = this.activeSort();

    if (!currentSort || currentSort.field !== field) {
      this.activeSort.set({ field, order: 'asc' });
      return;
    }

    if (currentSort.order === 'asc') {
      this.activeSort.set({ field, order: 'desc' });
      return;
    }

    this.activeSort.set(null);
  }

  getAriaSort(column: AppTableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!this.isColumnSortable(column)) {
      return null;
    }

    const currentSort = this.activeSort();

    if (!currentSort || currentSort.field !== this.getColumnKey(column)) {
      return 'none';
    }

    return currentSort.order === 'asc' ? 'ascending' : 'descending';
  }

  getSortIcon(column: AppTableColumn<T>): string {
    if (!this.isColumnSortable(column)) {
      return '';
    }

    const currentSort = this.activeSort();

    if (!currentSort || currentSort.field !== this.getColumnKey(column)) {
      return '↕';
    }

    return currentSort.order === 'asc' ? '↑' : '↓';
  }

  isActionVisible(action: AppTableRowAction<T>, item: T): boolean {
    return action.visible?.(item) ?? true;
  }

  isActionDisabled(action: AppTableRowAction<T>, item: T): boolean {
    return action.disabled?.(item) ?? false;
  }

  getActionTooltip(action: AppTableRowAction<T>): string {
    return action.tooltip ?? action.title ?? action.label;
  }

  getActionAriaLabel(action: AppTableRowAction<T>): string {
    return action.ariaLabel ?? this.getActionTooltip(action);
  }

  getActionClasses(action: AppTableRowAction<T>): string {
    if (action.tone === 'danger') {
      return 'hover:bg-red-600 hover:text-white focus:ring-red-600';
    }

    return 'hover:bg-blue-900 hover:text-white focus:ring-blue-900';
  }

  onRowAction(action: AppTableRowAction<T>, item: T): void {
    if (this.isActionDisabled(action, item)) {
      return;
    }

    this.rowAction.emit({
      actionId: action.id,
      action,
      item,
    });
  }

  getCellContext(item: T, column: AppTableColumn<T>): AppTableCellContext<T> {
    return {
      $implicit: item,
      item,
      column,
      value: this.getCellValue(item, column),
    };
  }

  private getSortValue(item: T, column: AppTableColumn<T>): AppTableSortValue {
    if (column.sortValue) {
      return column.sortValue(item);
    }

    const value = this.getCellValue(item, column);

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date ||
      value == null
    ) {
      return value;
    }

    return String(value);
  }

  private compareValues(a: AppTableSortValue, b: AppTableSortValue): number {
    if (a == null && b == null) {
      return 0;
    }

    if (a == null) {
      return 1;
    }

    if (b == null) {
      return -1;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    return String(a).localeCompare(String(b), 'pt-BR', {
      numeric: true,
      sensitivity: 'base',
    });
  }
}
