import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  template: `
    <p-confirmDialog
      key="app-confirm-dialog"
      [modal]="true"
      [closable]="true"
      [closeOnEscape]="true"
      [blockScroll]="true"
      [dismissableMask]="true"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfirmDialogComponent {}
