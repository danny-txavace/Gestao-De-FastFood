import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GridApi, GridOptions, GridReadyEvent, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { BtnTableRegister } from '../btn-table-register/btn-table-register';
import { FormatCurrency, FormatDateByCountry } from '../../../../_utils/global-methods';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { NotificationHub } from '../../../../_services/notification-hub';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { CountUpRespository } from '../../../../_repositories/count-up-respository';

ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-main-register',
  imports: [TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule, TranslateModule],
  templateUrl: './main-register.html',
  styleUrl: './main-register.scss'
})
export class MainRegister implements OnInit, OnDestroy {
  private readonly cashRegstService = inject(CashRegisterService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly translateService = inject(TranslateService);
  private dialogCreateRep = inject(DialogCreateRepository);
  private readonly countUpRep = inject(CountUpRespository);
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

   // Total Cards
  @ViewChild ('countUpAmount_InitialBalance') countUpAmount_InitialBalance!: ElementRef;
  @ViewChild ('countUpAmount_TotalRevenue') countUpAmount_TotalRevenue!: ElementRef;
  @ViewChild ('countUpAmount_TotalExpense') countUpAmount_TotalExpense!: ElementRef;
  @ViewChild ('countUpAmount_TotalProfit') countUpAmount_TotalProfit!: ElementRef;

  constructor()
  {}

  ngOnInit(): void {
    this.loadingCards();
    this.tableData();

    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.tableData();
      })
    );

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => {
        this.loadingCards();
        this.refreshLoadingTable();
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
        minWidth: 80,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRendererSelector: (params: any) => {
          if (params.node.rowPinned === 'bottom') {
            return {
              component: null,
              params: null
            };
          }

          return {
            component: BtnTableRegister,
            params: { ...params }
          };
        }
      },
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        cellClass: 'ag_cell_row_index',
        cellRenderer: (params: any) => {
          return params.node.rowPinned === 'bottom' ? '' : params.value || '';
        },
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.OPERATOR'),
        field: 'operator', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_start',
        cellRenderer: (params: any) => {
          return params.node.rowPinned === 'bottom' ? '' : params.value || '';
        },
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.STATUS.TITLE'),
        field: 'status',
        minWidth: 100,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          const map: any = {
            true:  { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.OPENED'),   color: "status_green" },
            false: { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.CLOSED'), color: "status_red" }
          };

          if (!map[params.value]) {
            return '';
          }

          const state = map[params.value];

          return `
            <span class="px-2 py-1 rounded-[7px] text-[12pt] font-normal border-1 ${state.color}">
              ${state.label}
            </span>
          `;
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.TOTAL_OPEN'),
        field: 'totalOpened', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.TOTAL_CLOSED'),
        field: 'totalClosed', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.OPENED_AT'),
        field: 'openedAt',
        minWidth: 200,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountry(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CLOSED_AT'),
        field: 'closedAt',
        minWidth: 200,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountry(params.value);
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
      this.cashRegstService.getAll().subscribe((data: any) => {
        this.tableLoading = false;
        this.rowData = data;
        this.applyPagination();
        this.cdr.detectChanges();
      })
    );
  }

  private refreshLoadingTable(): void
  {
    this.subs.add(
      this.cashRegstService.getAll().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
        this.cdr.detectChanges();
      })
    );
  }

  private loadingCards(): void
  {
    this.subs.add(
      this.cashRegstService.getCards().subscribe(value => {
        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_InitialBalance, value.initialBalance);
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalRevenue, value.totalRevenue);
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalExpense, value.totalExpense);
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_TotalProfit, value.totalProfit);
        }, 300)
      })
    );
  }

  onDialogOpenCash(): void {
    const payload = {
      format: 'open-cash_register',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }

  onDialogCloseCash(): void {
    const payload = {
      format: 'close-cash_register',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }

  onDialogCashIn(): void {
    const payload = {
      format: 'create-cash_register',
      isVisible: true,
      id: 'cash in'
    }
    this.dialogCreateRep.send(payload)
  }

  onDialogCashOut(): void {
    const payload = {
      format: 'create-cash_register',
      isVisible: true,
      id: 'cash out'
    }
    this.dialogCreateRep.send(payload)
  }
}
