import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { AppDialogSize } from './app-dialog.types';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [DialogModule],
  template: `
    <p-dialog
      [visible]="visible()"
      [header]="title()"
      [modal]="true"
      [closable]="closable()"
      [dismissableMask]="dismissableMask()"
      [closeOnEscape]="closeOnEscape()"
      [blockScroll]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="dialogStyle()"
      [breakpoints]="breakpoints"
      (visibleChange)="onVisibleChange($event)"
      (onHide)="onHide()"
    >
      <ng-content />
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialogComponent {
  readonly visible = input(false);
  readonly title = input('');
  readonly size = input<AppDialogSize>('md');
  readonly closable = input(true);
  readonly dismissableMask = input(false);
  readonly closeOnEscape = input(true);
  readonly visibleChange = output<boolean>();
  readonly closed = output<void>();

  readonly breakpoints = {
    '960px': '90vw',
    '640px': '96vw',
  };

  readonly dialogStyle = computed(() => {
    const widths: Record<AppDialogSize, string> = {
      sm: '28rem',
      md: '40rem',
      lg: '56rem',
      xl: '72rem',
    };

    return { width: widths[this.size()] };
  });

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.closed.emit();
  }
}
