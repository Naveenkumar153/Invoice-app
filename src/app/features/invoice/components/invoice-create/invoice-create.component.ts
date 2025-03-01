import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
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
import { catchError, combineLatest, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
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
  invoiceForm!: FormGroup<any>;
  subTotal:number = 0;
  customerList$!: Observable<Customer[]>;
  taxList$!: Observable<Tax[]>;
  productList$!: Observable<Product[]>;
  invoiceProducts!:FormArray<any>;
  invoiceProduct!:FormGroup<any>;
  destroy$ = new Subject<void>();
  currentInvoiceTax:{ percentage:number, type:string } = { percentage: 0, type: '' };
  summary:{ total:number,tax:number,netTotal:number } = {
    total: 0,
    tax: 0,
    netTotal: 0
  };

  get invoiceProductsArray(){
    return this.invoiceForm.get('products') as FormArray;
  }

  ngOnInit(): void {
    this.createForm();
    this.initialData();
  };

  ngOnDestroy(): void {  
    this.destroy$.next();
    this.destroy$.complete();
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
    // this.invoiceService.getSingleCustomer(event.value)
    // .pipe(
    //   takeUntil(this.destroy$),
    //   switchMap((customer:Customer) => {
    //     if (!customer) throw new Error('Customer not found');
    //     return this.invoiceService.getSingleTax(customer.taxId)
    //     .pipe(
    //       catchError(err => {
    //         console.error('Error fetching tax:', err);
    //         return of({} as Tax); // Return empty tax object on error
    //       }),
    //       map(tax => ({ customer, tax })) // Combine customer & tax
    //     )
    //   }),
    //   catchError(err => {
    //     console.error('Error fetching customer:', err);
    //     return of({ customer: {} as Customer, tax: {} as Tax });
    //   })
    // )
    // .subscribe(({ customer, tax })=>{
    //   console.log('Customer:', customer);
    //   console.log('Tax:', tax);
    //   this.invoiceForm.patchValue({
    //     customerName: customer.name,
    //     address: customer.address,
    //     taxCode: customer.textCode
    //   });
    //   this.addProduct();
    // });


    // Fetch the initial customer
    this.invoiceService.getSingleCustomer(event.value)
    .pipe(
      takeUntil(this.destroy$),
      switchMap((customer: Customer | null) => {
        if (!customer) {
          return of([{} as Customer, {} as Tax, [] as Tax[]]); // Ensure consistent tuple structure
        }

        return combineLatest([
          of(customer),
          this.invoiceService.getSingleTax(customer.taxId).pipe(
            catchError(() => of({} as Tax))
          ),
          this.taxList$.pipe(
            catchError(() => of([] as Tax[]))
          )
        ]).pipe(
          catchError(() => of([{} as Customer, {} as Tax, [] as Tax[]]))
        );
      })
    )
    .subscribe((result) => {
      const [customer, tax, taxList]: [Customer, Tax, Tax[]] = result as [Customer, Tax, Tax[]];

      console.log('Customer:', customer);
      console.log('Tax:', tax);
      console.log('Tax List:', taxList);

      this.invoiceForm.patchValue({
        customerName: customer?.name || '',
        address: customer?.address || '',
        taxCode: taxList.some(t => t.id === customer.taxId) ? customer.taxId : null
      });
      this.addProduct();
    });
  };

  onTaxChange(event:MatSelectChange):void{
    console.log(event);
    this.invoiceService.getSingleTax(event.value)
    .pipe(
      takeUntil(this.destroy$), 
      catchError(err => of({} as Tax))
    ).subscribe((data:Tax)=>{
      this.currentInvoiceTax.percentage = data.percentage;
      this.currentInvoiceTax.type = data.type;
      this.summaryCalculation();
    });
  };

  onProductChange(event:MatSelectChange,i:any):void{
    this.invoiceService.getSingleProduct(event.value).pipe(
      takeUntil(this.destroy$),
      catchError(err => of({} as Product))
    ).subscribe((data:Product) => {
      this.invoiceProduct = this.invoiceProducts.at(i) as FormGroup;
      this.invoiceProduct.patchValue({
        productName: data.name,
        price: data.price
      });
      this.calculateTotal(i);
    })
  };

 calculateTotal(index:number):void{
    this.invoiceProducts = this.invoiceProductsArray;
    let product = this.invoiceProducts.at(index) as FormGroup;
    let total =  product.get('qty')?.value * product.get('price')?.value;
    product.patchValue({
      total: total
    });
    this.summaryCalculation();
  }

  addProduct():void{
    this.invoiceProducts = this.invoiceForm.get('products') as FormArray;
    this.invoiceProducts.push(this.generateRow());
    this.dataSource.data = this.invoiceProductsArray.controls;
    this.summaryCalculation();
    this.cdRef.markForCheck();
  };

  generateRow(){
    return this.fb.group({
      productId:['',[Validators.required]],
      productName:[''],
      qty:[1],
      price:[0],
      total:[{value:0, disabled:true}]
    });
  };

  removeProduct(index: number): void {
    if(confirm('Are you sure you want to delete this product?')){
      this.invoiceProductsArray.removeAt(index);
      this.dataSource.data = this.invoiceProductsArray.controls;
      this.summaryCalculation();
    }
  };

  summaryCalculation(): void {
    const arr = this.invoiceProductsArray.getRawValue();
    // Reset summary before calculating
    this.summary.total = 0;
    this.summary.tax = 0;
    this.summary.netTotal = 0;
    if(arr.length === 0) return;
    arr.forEach((product) => {
      const total = product.qty * product.price;
      let tax     = 0;
  
      if (this.currentInvoiceTax.type === 'E') {
        tax = (this.currentInvoiceTax.percentage / 100) * total;
      } else if (this.currentInvoiceTax.type === 'I') {
        tax = total - (total / (1 + this.currentInvoiceTax.percentage / 100));
      }
      // Accumulate values
      this.summary.total += total;
      this.summary.tax += tax;
      this.summary.netTotal = this.summary.total + this.summary.tax;
    });
    this.cdRef.markForCheck();
  }
  
  
 

}
