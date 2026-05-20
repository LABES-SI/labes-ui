import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accessibility, LucideAngularModule, ShieldCheck, University } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly icons = {
    accessibility: Accessibility,
    shield: ShieldCheck,
    university: University,
  };
}
