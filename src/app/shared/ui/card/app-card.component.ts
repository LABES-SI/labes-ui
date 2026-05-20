import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CardModule],
  template: `
    <p-card [styleClass]="styleClass()">
      @if (title()) {
        <ng-template pTemplate="title">{{ title() }}</ng-template>
      }

      @if (subtitle()) {
        <ng-template pTemplate="subtitle">{{ subtitle() }}</ng-template>
      }

      <ng-content />
    </p-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCardComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly variant = input<'default' | 'glass' | 'flat'>('default');

  readonly styleClass = computed(() => `app-card-shell app-card-shell--${this.variant()}`);
}
