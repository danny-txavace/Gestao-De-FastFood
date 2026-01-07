import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, GridApi, GridOptions, GridReadyEvent, RowSelectionOptions } from 'ag-grid-community';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../../_services/order-service';
import { FormatQty, FormatCurrency, FormatDateByCountry, formatPhoneNumber } from '../../../../_utils/global-methods';
import { BtnTableOrderList } from './btn-table-order-list/btn-table-order-list';
import { OrderStatusEnum } from '../../../../_interfaces/orders-list-dto';
import { PosCheckRepository } from '../../../../_repositories/pos-check-repository';
import { NotificationHub } from '../../../../_services/notification-hub';

ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-pos-order-list',
  imports: [TranslateModule, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './pos-order-list.html',
  styleUrl: './pos-order-list.scss',
})
export class PosOrderList implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly translateService = inject(TranslateService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly cdr = inject(ChangeDetectorRef);
  posCheckRep = inject(PosCheckRepository);
  cashRegisterId: string = '';

  private subs = new Subscription();
  tableLoading: boolean = false;

  searchInput: string = '';
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  filteredData: any[] = [];

  headerHeight = 50;
  rowHeight = 50;

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
      this.posCheckRep.currentCheckPos$.subscribe(value => {
        if (value !== null && value.cashRegisterId !== '')
        {
          this.cashRegisterId = value.cashRegisterId;
          this.loadingData();
        }
      })
    );

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => {
        this.refreshLoadingData();
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
      }
    ];
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSearch()
  {
    const searchLower = this.searchInput.toLowerCase();

    if (!searchLower) {
      this.filteredData = this.rowData;
    } else {
      this.filteredData = this.rowData.filter(item =>
        Object.values(item).some(val => val?.toString().toLowerCase().includes(searchLower))
      );
    }

    // Update grid with filtered data
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.filteredData);
      this.gridApi.refreshClientSideRowModel();
    }
  }

  private loadingData(): void
  {
    this.tableLoading = true;
    this.subs.add(
      this.orderService.getAllById(this.cashRegisterId).subscribe((data: any) => {
        this.tableLoading = false;
        this.rowData = data;
        this.cdr.detectChanges();
      })
    );
  }

  private refreshLoadingData(): void
  {
    this.subs.add(
      this.orderService.getAllById(this.cashRegisterId).subscribe((data: any) => {
        this.rowData = data;
        this.cdr.detectChanges();
      })
    );
  }
}
