import { Routes } from '@angular/router';

export const acessibilidadeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/acessibilidade-page/acessibilidade-page.component').then(
        (m) => m.AcessibilidadePageComponent,
      ),
  },
];
