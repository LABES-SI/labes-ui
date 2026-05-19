import { Routes } from '@angular/router';

export const dashboardsRoutes: Routes = [
  {
    path: 'acessibilidade',
    loadComponent: () =>
      import('./pages/acessibilidade-page/acessibilidade-page.component').then(
        (m) => m.AcessibilidadePageComponent,
      ),
  },
];
