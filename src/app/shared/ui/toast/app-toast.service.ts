import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export type AppToastStatus = 'success' | 'error' | 'warning' | 'info';

export interface AppToastMessage {
  status: AppToastStatus;
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class AppToastService {
  private readonly messageService = inject(MessageService);

  show(toast: AppToastMessage): void {
    this.messageService.add({
      key: 'app-toast',
      severity: toast.status === 'warning' ? 'warn' : toast.status,
      summary: toast.title,
      detail: toast.message,
      life: toast.duration ?? 5000,
    });
  }

  success(message: string, title?: string): void {
    this.show({ status: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ status: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ status: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ status: 'info', message, title });
  }
}
