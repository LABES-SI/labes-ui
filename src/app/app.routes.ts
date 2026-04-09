import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
