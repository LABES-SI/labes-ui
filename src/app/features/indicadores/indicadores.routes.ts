import { Routes } from '@angular/router';

export const indicadoresRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/indicadores-home-page/indicadores-home-page.component').then(
        (m) => m.IndicadoresHomePageComponent,
      ),
  },
  {
    path: 'acessibilidade',
    loadComponent: () =>
      import('./pages/acessibilidade-page/acessibilidade-page.component').then(
        (m) => m.AcessibilidadePageComponent,
      ),
  },
  {
    path: 'conectividade',
    loadComponent: () =>
      import('./pages/conectividade-page/conectividade-page.component').then(
        (m) => m.ConectividadePageComponent,
      ),
  },
];
