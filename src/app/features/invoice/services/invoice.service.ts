import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Invoice } from '../model/invoice.model';
import { Customer } from '../model/customer.model';
import { Tax } from '../model/tax.model';
import { Product } from '../model/product.model';

@Injectable()
export class InvoiceService {

  constructor(private http:HttpClient) { };

  getAllTax(){
    return this.http.get<Tax[]>("http://localhost:4000/tax");
  };

  getSingleTax(){
    return this.http.get<Tax[]>("http://localhost:4000/tax");
  };

  getAllProduct(){
    return this.http.get<Product[]>('http://localhost:4000/product');
  };

  getSingleProduct(productId:string){
    return this.http.get<Product>('http://localhost:4000/product' + productId);
  };

  getAllCustomer(){
    return this.http.get<Customer[]>("http://localhost:4000/customer");
  };

  getSingleCustomer(customerId:string){
    return this.http.get<Customer>(`http://localhost:4000/customer/${customerId}`);
  };

  getAllInvoices(){
    return this.http.get<Invoice[]>('http://localhost:4000/invoice');
  };

  getSingleInvoice(invoiceId:string){
    return this.http.get<Invoice>('http://localhost:4000/invoice' + invoiceId);
  };

}
