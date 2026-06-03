import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio',
  },
  {
    path: 'inicio',
    loadChildren: () => import('./features/inicio/inicio.routes').then((m) => m.inicioRoutes),
  },
  {
    path: 'sobre',
    loadChildren: () => import('./features/sobre/sobre.routes').then((m) => m.sobreRoutes),
  },
  {
    path: 'dashboards',
    loadChildren: () =>
      import('./features/dashboards/dashboards.routes').then((m) => m.dashboardsRoutes),
  },
  {
    path: 'colaboradores',
    loadChildren: () =>
      import('./features/colaboradores/colaboradores.routes').then((m) => m.colaboradoresRoutes),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
