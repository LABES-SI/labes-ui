import { Routes } from '@angular/router';

export const inicioRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inicio-page/inicio-page.component').then((m) => m.InicioPageComponent),
  },
];
