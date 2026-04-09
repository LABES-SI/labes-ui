import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-feature-card',
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureCardComponent {
  readonly eyebrow = input('feature');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
