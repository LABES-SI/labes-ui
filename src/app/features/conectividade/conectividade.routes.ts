import { Routes } from '@angular/router';

export const conectividadeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/conectividade-page/conectividade-page.component').then(
        (m) => m.ConectividadePageComponent,
      ),
  },
];
