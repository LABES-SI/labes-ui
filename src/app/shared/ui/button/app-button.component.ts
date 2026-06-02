import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppButtonSize, AppButtonVariant } from './app-button.types';

type PrimeButtonSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'help'
  | 'primary'
  | 'secondary'
  | 'contrast';
type PrimeButtonSize = 'small' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [ButtonModule, LucideAngularModule, RouterLink],
  template: `
    @if (routerLink()) {
      <a
        pButton
        [routerLink]="routerLink()"
        [attr.aria-label]="ariaLabel() || label()"
        [class]="styleClass()"
      >
        <span class="inline-flex items-center justify-center gap-2">
          @if (icon()) {
            <lucide-icon class="h-4 w-4" [img]="resolvedIcon()" />
          }
          <span>{{ label() }}</span>
          @if (trailingIcon()) {
            <lucide-icon class="h-4 w-4" [img]="resolvedTrailingIcon()" />
          }
        </span>
      </a>
    } @else {
      <p-button
        [type]="type()"
        [label]="icon() || trailingIcon() ? undefined : label()"
        [disabled]="disabled() || loading()"
        [loading]="loading()"
        [severity]="primeSeverity()"
        [size]="primeSize()"
        [text]="variant() === 'ghost'"
        [link]="variant() === 'link'"
        [fluid]="fullWidth()"
        [styleClass]="styleClass()"
        [ariaLabel]="ariaLabel() || label()"
        (onClick)="onClicked($event)"
      >
        @if (icon() || trailingIcon()) {
          <ng-template pTemplate="content">
            <span class="inline-flex items-center justify-center gap-2">
              @if (!loading()) {
                @if (icon()) {
                  <lucide-icon class="h-4 w-4" [img]="resolvedIcon()" />
                }
              }
              @if (label()) {
                <span>{{ label() }}</span>
              }
              @if (!loading() && trailingIcon()) {
                <lucide-icon class="h-4 w-4" [img]="resolvedTrailingIcon()" />
              }
            </span>
          </ng-template>
        }
      </p-button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButtonComponent {
  readonly label = input('');
  readonly variant = input<AppButtonVariant>('primary');
  readonly size = input<AppButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input('');
  readonly routerLink = input<string | null>(null);
  readonly icon = input<LucideIconData | null>(null);
  readonly trailingIcon = input<LucideIconData | null>(null);
  readonly clicked = output<MouseEvent>();

  readonly primeSeverity = computed<PrimeButtonSeverity | undefined>(() => {
    const variant = this.variant();

    if (variant === 'primary') {
      return 'primary';
    }

    if (variant === 'secondary' || variant === 'ghost') {
      return 'secondary';
    }

    if (variant === 'success' || variant === 'danger') {
      return variant;
    }

    return undefined;
  });

  readonly primeSize = computed<PrimeButtonSize | undefined>(() => {
    const size = this.size();
    return size === 'md' ? undefined : size === 'sm' ? 'small' : 'large';
  });

  readonly styleClass = computed(() => `app-button app-button--${this.variant()}`);
  readonly resolvedIcon = computed(() => this.icon() ?? undefined);
  readonly resolvedTrailingIcon = computed(() => this.trailingIcon() ?? undefined);

  onClicked(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      return;
    }

    this.clicked.emit(event);
  }
}
