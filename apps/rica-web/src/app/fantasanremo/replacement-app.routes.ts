import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    { path: '', loadComponent: () => import('./fantasanremo-page.component').then(m => m.FantasanremoPageComponent) }
];
