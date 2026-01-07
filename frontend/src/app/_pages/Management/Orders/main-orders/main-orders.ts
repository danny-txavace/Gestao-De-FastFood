import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, RowSelectionOptions, GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { OrderStatusEnum } from '../../../../_interfaces/orders-list-dto';
import { NotificationHub } from '../../../../_services/notification-hub';
import { OrderService } from '../../../../_services/order-service';
import { formatPhoneNumber, FormatQty, FormatCurrency, FormatDateByCountry } from '../../../../_utils/global-methods';
import { BtnTableOrderList } from '../../POS/pos-order-list/btn-table-order-list/btn-table-order-list';

ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-main-orders',
  imports: [TranslateModule, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './main-orders.html',
  styleUrl: './main-orders.scss',
})
export class MainOrders implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

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
  gridApi!: GridApi;

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
        headerName: this.translateService.instant('TABLE_HEADER.ACTIONS'),
        minWidth: 100, flex: 1,
        cellRenderer: BtnTableOrderList,
        cellClass: 'ag_cell_center'
      },
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        cellClass: 'ag_cell_row_index'
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.OPERATOR'),
        field: 'operator', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_start',
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.DESCRIPTION'),
        field: 'description', minWidth: 300, flex: 1,
        cellClass: 'ag_cell_start',
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.QTY'),
        field: 'totalQty', minWidth: 80, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatQty(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.TOTAL_AMOUNT'),
        field: 'totalPay', minWidth: 120, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.PAID_AMOUNT'),
        field: 'totalPaid', minWidth: 120, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CHANGE'),
        field: 'totalChange', minWidth: 120, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.STATUS.TITLE'),
        field: 'status',
        minWidth: 120,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          const map: any = {
            [OrderStatusEnum.Cancelled]: { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.CANCELLED'),   color: "bg-gray-600/20 border-gray-800" },
            [OrderStatusEnum.Pending]: { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.PENDING'), color: "status_orange" },
            [OrderStatusEnum.Paid]: { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.PAID'),   color: "status_green" },
          };

          if (!map[params.value]) {
            return '';
          }

          const state = map[params.value];

          return `
            <span class="px-2 py-1 rounded-[7px] text-[12pt] font-normal border-1  ${state.color}">
              ${state.label}
            </span>
          `;
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.DATE_TIME'),
        field: 'createdAt', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountry(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CUSTOMER_NAME'),
        field: 'customerName', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_start',
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CUSTOMER_PHONE'),
        field: 'customerPhone', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return formatPhoneNumber(params.value);
        }
      },
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
      this.orderService.getAll().subscribe((data: any) => {
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
      this.orderService.getAll().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
        this.cdr.detectChanges();
      })
    );
  }
}
