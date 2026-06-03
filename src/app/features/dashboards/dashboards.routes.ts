import { Routes } from '@angular/router';

export const dashboardsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-home-page/dashboard-home-page.component').then(
        (m) => m.DashboardHomePageComponent,
      ),
  },
  {
    path: 'acessibilidade',
    loadComponent: () =>
      import('./pages/acessibilidade-page/acessibilidade-page.component').then(
        (m) => m.AcessibilidadePageComponent,
      ),
  },
];
