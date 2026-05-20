import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { AppConfirmDialogComponent } from '../confirm-dialog/app-confirm-dialog.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule, AppConfirmDialogComponent],
  template: `
    <p-toast key="app-toast" position="top-right" />
    <app-confirm-dialog />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToastComponent {}
