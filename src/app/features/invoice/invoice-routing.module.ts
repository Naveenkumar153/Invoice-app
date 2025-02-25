import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path:'invoice',
    loadComponent: () => import('./components/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
  },
  {
    path:'invoice/create',
    loadComponent: () => import('./components/invoice-create/invoice-create.component').then(m => m.InvoiceCreateComponent),
  },
  {
    path:'invoice/edit/:id',
    loadComponent: () => import('./components/invoice-create/invoice-create.component').then(m => m.InvoiceCreateComponent),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
