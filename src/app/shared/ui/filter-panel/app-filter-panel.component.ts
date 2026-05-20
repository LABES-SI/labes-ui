import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ChevronDown,
  ChevronUp,
  ListFilter,
  LucideAngularModule,
  LucideIconData,
} from 'lucide-angular';
import { AppButtonComponent } from '../button/app-button.component';
import { AppCardComponent } from '../card/app-card.component';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [LucideAngularModule, AppButtonComponent, AppCardComponent],
  template: `
    <app-card>
      <div class="flex flex-col gap-4">
        @if (showToggle()) {
          <button
            class="flex w-full items-center justify-between text-left"
            type="button"
            [attr.aria-expanded]="expanded()"
            [attr.aria-label]="ariaLabel()"
            (click)="toggleExpanded()"
          >
            <span class="flex items-center gap-2">
              <lucide-icon
                class="h-5 w-5 text-[20px] text-slate-500"
                [img]="leadingIconResolved()"
              />
              <span class="text-[0.9375rem] font-medium text-slate-900">{{ title() }}</span>
            </span>
            <lucide-icon
              class="h-5 w-5 text-[20px] text-slate-500"
              [img]="expanded() ? expandedIconResolved() : collapsedIconResolved()"
            />
          </button>
        } @else {
          <div class="flex items-center gap-2">
            <lucide-icon class="h-5 w-5 text-[20px] text-slate-500" [img]="leadingIconResolved()" />
            <span class="text-[0.9375rem] font-medium text-slate-900">{{ title() }}</span>
          </div>
        }

        @if (!showToggle() || expanded()) {
          <div class="flex flex-col gap-4">
            <ng-content />

            @if (showToggle() && showActions()) {
              <div class="flex items-center justify-end gap-3 pt-2">
                <app-button
                  [label]="clearLabel()"
                  variant="secondary"
                  size="md"
                  [disabled]="clearDisabled()"
                  (clicked)="cleared.emit()"
                />
                <app-button
                  [label]="searchLabel()"
                  variant="primary"
                  size="md"
                  [disabled]="searchDisabled()"
                  (clicked)="searched.emit()"
                />
              </div>
            }
          </div>
        }
      </div>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFilterPanelComponent {
  readonly title = input('Filtros de Pesquisa');
  readonly expanded = input(false);
  readonly showToggle = input(true);
  readonly showActions = input(true);
  readonly ariaLabel = input('Alternar filtros');
  readonly searchLabel = input('Buscar');
  readonly clearLabel = input('Limpar');
  readonly searchDisabled = input(false);
  readonly clearDisabled = input(false);
  readonly leadingIcon = input<LucideIconData | null>(ListFilter);
  readonly expandedIcon = input<LucideIconData | null>(ChevronUp);
  readonly collapsedIcon = input<LucideIconData | null>(ChevronDown);

  readonly expandedChange = output<boolean>();
  readonly searched = output<void>();
  readonly cleared = output<void>();

  readonly leadingIconResolved = () => this.leadingIcon() ?? ListFilter;
  readonly expandedIconResolved = () => this.expandedIcon() ?? ChevronUp;
  readonly collapsedIconResolved = () => this.collapsedIcon() ?? ChevronDown;

  toggleExpanded(): void {
    this.expandedChange.emit(!this.expanded());
  }
}
