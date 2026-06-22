import { Routes } from '@angular/router';

export const colaboradoresRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/colaboradores-page/colaboradores-page.component').then(
        (m) => m.ColaboradoresPageComponent,
      ),
  },
];
