import { Routes } from '@angular/router';

export const sobreRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sobre-page/sobre-page.component').then((m) => m.SobrePageComponent),
  },
];
