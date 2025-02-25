import { InvoiceProducts } from "./invoiceProduct";

export interface Invoice{
    id:number,
    customerId:string,
    customerName:string,
    deliveryAddress:string,
    invoiceDate:Date,
    taxCode:string,
    taxPercentage:number,
    taxType:string,
    total:number,
    tax:number,
    netTotal:string, 
    products:InvoiceProducts[],
}