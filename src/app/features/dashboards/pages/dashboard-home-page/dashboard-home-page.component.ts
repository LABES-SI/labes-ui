import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DashboardHeroComponent } from '../../components/dashboard-hero/dashboard-hero.component';
import { DashboardCardsComponent } from '../../components/dashboard-cards/dashboard-cards.component';

@Component({
  selector: 'app-dashboard-home-page',
  standalone: true,
  imports: [DashboardHeroComponent, DashboardCardsComponent],
  templateUrl: './dashboard-home-page.component.html',
  styleUrl: './dashboard-home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHomePageComponent {}
