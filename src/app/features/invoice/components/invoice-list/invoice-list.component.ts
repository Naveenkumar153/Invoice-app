import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { InvoiceService } from '../../services/invoice.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Invoice } from '../../model/invoice.model';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    MatTableModule,MatCardModule,
    CommonModule,MatPaginatorModule,MatSortModule,MatButtonModule,
    MatIconModule,RouterModule, MatSnackBarModule
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
  providers:[InvoiceService],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class InvoiceListComponent implements OnInit, OnDestroy {

  constructor(private invoiceService:InvoiceService, private snakebar:MatSnackBar, private cdRfc: ChangeDetectorRef) { }
  @ViewChild(MatTable) table!: MatTable<any>;

  dataSource: MatTableDataSource<Invoice> = new MatTableDataSource<Invoice>([]);
  displayedColumns: string[] = ['invoiceNumber', 'customerName', 'invoiceDate', 'total', 'tax', 'netTotal','action'];
  private destory$ = new Subject<void>();
  ngOnInit(): void {
    this.getInvoiceList();
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  };

  getInvoiceList(): void {
    this.invoiceService.getAllInvoices().pipe(takeUntil(this.destory$)).subscribe((invoices) => {
      this.dataSource = new MatTableDataSource(invoices || []);
      this.table.renderRows();
      this.cdRfc.detectChanges();
    });
  };

  deleteInvoice(invoiceId: string): void {
    this.invoiceService.deleteInvoice(invoiceId).pipe(takeUntil(this.destory$)).subscribe((res) => {
      this.snakebar.open('Invoice deleted successfully', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      this.getInvoiceList();
    });
  }

}
