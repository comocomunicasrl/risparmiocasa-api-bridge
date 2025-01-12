import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    { path: 'fantasanremo', loadComponent: () => import('./fantasanremo/fantasanremo-page.component').then(m => m.FantasanremoPageComponent) }
];
