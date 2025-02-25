import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        redirectTo: 'invoice',
        pathMatch: 'prefix'
    },
    {
        path:'',
        loadChildren: () => import('./features/invoice/invoice.module').then(m => m.InvoiceModule),
    }
];
