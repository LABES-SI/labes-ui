import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { AppTagStatus } from './app-tag.types';

type PrimeTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [TagModule],
  template: `<p-tag [value]="label()" [severity]="primeSeverity()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTagComponent {
  readonly label = input('');
  readonly status = input<AppTagStatus>('neutral');

  readonly primeSeverity = computed<PrimeTagSeverity>(() => {
    const status = this.status();
    return status === 'neutral' ? 'secondary' : status === 'warning' ? 'warn' : status;
  });
}
