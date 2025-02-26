import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatNativeDateModule, MatOptionSelectionChange, provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceItemComponent } from '../../containers/invoice-item/invoice-item.component';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { catchError, Observable } from 'rxjs';
import { Customer } from '../../model/customer.model';
import { Tax } from '../../model/tax.model';
import { Product } from '../../model/product.model';
import { InvoiceService } from '../../services/invoice.service';


const ELEMENT_DATA = [
  {productId: 1, productName: 'gold', qty: 2, price: 10, total: 20 },
 
];
@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule,ReactiveFormsModule,FormsModule,MatCardModule,MatSelectModule,
    MatFormFieldModule,MatButtonModule,MatDatepickerModule,MatInputModule,
    MatNativeDateModule, MatIconModule, InvoiceItemComponent,MatTableModule, 
    MatListModule,MatDividerModule
  ],
  providers:[MatDatepickerModule, provideNativeDateAdapter(),InvoiceService],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceCreateComponent implements OnInit, OnDestroy {

  
  constructor(private fb:FormBuilder, private router:Router, private invoiceService:InvoiceService, private cdRef:ChangeDetectorRef) { 
  }

  displayedColumns: string[] = ['productId', 'productName', 'qty', 'price','total','action'];
  dataSource = new MatTableDataSource<any>([]);;
  invoiceForm: any;
  total:number = 10;
  customerList$!: Observable<Customer[]>;
  taxList$!: Observable<Tax[]>;
  productList$!: Observable<Product[]>;
  invoiceProduct!:FormArray<any>;
  get invoiceProductsArray(){
    return this.invoiceForm.get('products') as FormArray;
  }

  ngOnInit(): void {
    this.createForm();
    this.initialData();
  };

  ngOnDestroy(): void {  
  };

  createForm():void{
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['',{ disabled:true }],
      invoiceDate: [new Date(),[Validators.required]],
      customerId:['',[Validators.required]],
      customerName:[''],
      taxCode:[''],
      address:[''],
      total:[0],
      tax:[0],
      netTotal:[0],
      products: this.fb.array([]),
    });
  };

  onSave():void{

  };

  onCancel():void{

  };

  SaveInvoice():void{

  };

  initialData():void{
     this.productList$ = this.invoiceService.getAllProduct();
     this.taxList$ = this.invoiceService.getAllTax();
     this.customerList$ = this.invoiceService.getAllCustomer();
  };

  onCustomerChange(event:MatSelectChange):void{
    console.log(event);
    this.invoiceService.getSingleCustomer(event.value).subscribe((data:Customer)=>{
      this.invoiceForm.patchValue({
        customerName: data.name,
        address: data.address,
        taxCode: data.textCode
      });
      this.addProduct();
    });
  };

  onTaxChange(event:MatSelectChange):void{
    console.log(event);
  };

  onProductChange(event:MatOptionSelectionChange<string>,i:any):void{
    console.log(event.source.value,i);
  }

  addProduct():void{
    this.invoiceProduct = this.invoiceForm.get('products') as FormArray;
    this.invoiceProduct.push(this.generateRow());
    this.dataSource.data = this.invoiceProductsArray.controls;
    this.cdRef.markForCheck();
  };

  generateRow(){
    return this.fb.group({
      productId:['',[Validators.required]],
      productName:[''],
      qty:[1],
      price:[0],
      total:['',{value:0, disabled:true}]
    });
  };

  removeProduct(index: number): void {
    this.invoiceProductsArray.removeAt(index);
    this.dataSource.data = this.invoiceProductsArray.controls;
  }
  
 

}
