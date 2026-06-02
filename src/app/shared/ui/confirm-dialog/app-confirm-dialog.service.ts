import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface AppConfirmDialogOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  status?: 'default' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class AppConfirmDialogService {
  private readonly confirmationService = inject(ConfirmationService);

  confirm(options: AppConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'app-confirm-dialog',
        header: options.title ?? 'Confirmação',
        message: options.message,
        acceptLabel: options.confirmLabel ?? 'Confirmar',
        rejectLabel: options.cancelLabel ?? 'Cancelar',
        acceptButtonProps: options.status === 'danger' ? { severity: 'danger' } : undefined,
        rejectButtonProps: { severity: 'secondary', outlined: true },
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
