import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    { path: '', loadComponent: () => import('./fantasanremo/fantasanremo-page.component').then(m => m.FantasanremoPageComponent) },
    { path: 'XA44OBLG', loadComponent: () => import('./fantasanremo/fantasanremo-page.component').then(m => m.FantasanremoPageComponent) }
];
