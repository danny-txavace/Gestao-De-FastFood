import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BtnTableCustomer } from '../btn-table-customer/btn-table-customer';
import { FormatDateByCountryNoTime, formatPhoneNumber, FormatQty } from '../../../../../_utils/global-methods';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, RowSelectionOptions, GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { DialogCreateRepository } from '../../../../../_repositories/dialog-create-repository';
import { CustomerService } from '../../../../../_services/customer-service';
import { NotificationHub } from '../../../../../_services/notification-hub';

ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-main-customers',
  imports: [TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './main-customers.html',
  styleUrl: './main-customers.scss',
})
export class MainCustomers implements OnInit, OnDestroy {
  private readonly customerService = inject(CustomerService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private dialogCreateRep = inject(DialogCreateRepository);

  private subs = new Subscription();
  tableLoading: boolean = false;

  searchInput: string = '';
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  filteredData: any[] = [];
  pageData: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  startIndex: number = 0;
  endIndex: number = 0;

  pageSize: number = 10;
  headerHeight = 50;
  rowHeight = 50;
  showTotalPag: number = 0;

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "singleRow",
    checkboxes: false,
    enableClickSelection: true
  };

  gridOptions: GridOptions = {
    defaultColDef: {
      autoHeight: false,
      suppressMovable: true, // can't move
      editable: false,
      sortable: true,
      unSortIcon: false,
      filter: false,
      resizable: false,
      headerClass: 'ag_header'
    }
  };
  private gridApi!: GridApi;

  ngOnInit(): void {
    this.tableData();

    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.tableData();
      })
    );

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => {
        this.refreshDataWithoutLoader();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe() }
  }

  tableData() {
    this.gridOptions.overlayNoRowsTemplate = `<span style="padding: 10px; color: red;">${ this.translateService.instant('COMMON.TABLE.NO_ROWS_TO_SHOWS') }</span>`;

    this.columnDefs =
    [
      {
        headerName: this.translateService.instant('COMMON.TABLE.HEADER_NAME.ACTIONS'),
        minWidth: 100, flex: 1,
        cellRenderer: BtnTableCustomer,
        cellClass: 'ag_cell_center'
      },
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        cellClass: 'ag_cell_row_index'
      },
      {
        headerName: 'FullName',
        field: 'fullName', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_start'
      },
      {
        headerName: this.translateService.instant('COMMON.TABLE.HEADER_NAME.PHONE_NUMBER'),
        field: 'phoneNumber', minWidth: 170, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return formatPhoneNumber(params.value);
        }
      },
      {
        headerName: "Qty. Orders",
        field: 'orderQty', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatQty(params.value);
        }
      },
      {
        headerName: "Created At",
        field: 'createdAt', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountryNoTime(params.value);
        }
      }
    ];

    this.loadingData();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSearch()
  {
    const searchLower = this.searchInput.toLowerCase();
    this.filteredData = this.rowData.filter(item =>
      Object.values(item).some(val => val?.toString().toLowerCase().includes(searchLower))
    );

    this.currentPage = 1;
    this.applyPagination();
  }

  applyPagination()
  {
    //const dataToPaginate = this.rowData;
    const dataToPaginate = this.searchInput ? this.filteredData : this.rowData;
    this.totalPages = Math.ceil(dataToPaginate.length / this.pageSize);
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, dataToPaginate.length);
    this.pageData = dataToPaginate.slice(this.startIndex, this.endIndex);
    this.showTotalPag = dataToPaginate.length;
  }

  gotToPrevious()
  {
    if (this.currentPage > 1)
    {
      this.currentPage--;
      this.applyPagination();
    }
  }

  goToNext()
  {
    if (this.currentPage < this.totalPages)
    {
      this.currentPage++;
      this.applyPagination();
    }
  }

  goToStart() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.applyPagination();
    }
  }

  goToEnd() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.applyPagination();
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = page;
    } else {
      if (page === '...') {
        return; // Não faz nada quando clicar nas reticências.
      }
    }
    this.applyPagination();
  }

  isNumber(value: number | string): value is number {
    return typeof value === 'number';
  }

  get totalPagesArray(): (number | string)[] {
    const maxVisiblePages = 5;
    const pages = [];

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, '...', this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1, '...', this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }

    return pages;
  }

  private loadingData(): void
  {
    this.tableLoading = true;
    this.subs.add(
      this.customerService.getAll().subscribe((data: any) => {
        this.tableLoading = false;
        this.rowData = data;
        this.applyPagination();
        this.cdr.detectChanges();
      })
    );
  }

  private refreshDataWithoutLoader(): void
  {
    this.subs.add(
      this.customerService.getAll().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
        this.cdr.detectChanges();
      })
    );
  }

  onOpenDialog(): void {
    const payload = {
      format: 'customer-create',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }
}
