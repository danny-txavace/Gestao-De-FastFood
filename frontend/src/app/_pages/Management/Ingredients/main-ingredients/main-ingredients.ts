import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, GridApi, GridOptions, RowSelectionOptions, GridReadyEvent } from 'ag-grid-community';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { NotificationHub } from '../../../../_services/notification-hub';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { IngredientService } from '../../../../_services/ingredient-service';
import { FormatCurrency, FormatDateByCountry, FormatDateByCountryNoTime, FormatQty } from '../../../../_utils/global-methods';
import { BtnTableIngredient } from '../btn-table-ingredient/btn-table-ingredient';
import { CountUpRespository } from '../../../../_repositories/count-up-respository';
import { CommonModule } from '@angular/common';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-main-ingredients',
  imports: [TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule, CommonModule],
  templateUrl: './main-ingredients.html',
  styleUrl: './main-ingredients.scss',
})
export class MainIngredients implements OnInit, OnDestroy {
  private readonly ingredientService = inject(IngredientService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogCreateRep = inject(DialogCreateRepository);
  private readonly countUpRep = inject(CountUpRespository);

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
  gridApi!: GridApi;

  // Total Cards
  @ViewChild ('countUpQty_active') countUpQty_active!: ElementRef;
  @ViewChild ('countUpQty_inactive') countUpQty_inactive!: ElementRef;
  @ViewChild ('countUpQty_totalActiveQty') countUpQty_totalActiveQty!: ElementRef;
  @ViewChild ('countUpQty_nearExpiry') countUpQty_nearExpiry!: ElementRef;
  @ViewChild ('countUpQty_expired') countUpQty_expired!: ElementRef;

  ngOnInit(): void {
    this.tableData();
    this.loadingCards();

    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.tableData();
      })
    );

    this.subs.add(
      this.hubNotif.receiveNotifs().subscribe(() => {
        this.refreshLoadingTable();
        this.loadingCards();
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
        minWidth: 120,
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
            component: BtnTableIngredient,
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
        headerName: this.translateService.instant('TABLE_HEADER.ITEM_NAME'),
        field: 'itemName', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_start',
      },
      {
        headerName: "Batch Nº",
        field: 'batchNumber', minWidth: 120, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return params.node.rowPinned === 'bottom' ? '' : params.value || '';
        },
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.BATCH_NUMBER'),
        field: 'packageSize', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatQty(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.PACKAGE_SIZE'),
        field: 'unitOfMeasure', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return params.node.rowPinned === 'bottom' ? '' : params.value || '';
        },
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.QTY'),
        field: 'quantity', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatQty(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.UNIT_PRICE'),
        field: 'unitCostPrice', minWidth: 180, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.TOTAL_PRICE'),
        field: 'totalCostPrice', minWidth: 180, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CREATED_AT'),
        field: 'createdAt',
        minWidth: 140,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountryNoTime(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.EXPIRATION_AT'),
        field: 'expirationAt',
        minWidth: 140,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountryNoTime(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.EXPIRY_STATUS.TITLE'),
        field: 'expirationStatus',
        minWidth: 150,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          const map: any = {
            "Valid":  { label: this.translateService.instant('TABLE_HEADER.EXPIRY_STATUS.OPTIONS.VALID'),   color: "status_green" },
            "Near Expiry": { label: this.translateService.instant('TABLE_HEADER.EXPIRY_STATUS.OPTIONS.NEAR_EXPIRY'), color: "status_orange" },
            "Expired": { label: this.translateService.instant('TABLE_HEADER.EXPIRY_STATUS.OPTIONS.EXPIRED'), color: "status_red" }
          };

          if (!params.value || !map[params.value]) {
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
        headerName: this.translateService.instant('TABLE_HEADER.STATUS.TITLE'),
        field: 'isActive',
        minWidth: 120,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          const map: any = {
            true:  { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.ACTIVE'),   color: "status_green" },
            false: { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.INACTIVE'), color: "status_red" }
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
        headerName: this.translateService.instant('TABLE_HEADER.LAST_UPDATE'),
        field: 'updatedAt',
        minWidth: 140,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountryNoTime(params.value);
        }
      }
    ];

    this.loadingTable();
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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    this.updateTotals();
    // Recalculate totals on any change that affects visible data
    this.gridApi.addEventListener('cellValueChanged', () => this.updateTotals());
    this.gridApi.addEventListener('filterChanged', () => this.updateTotals());
    this.gridApi.addEventListener('sortChanged', () => this.updateTotals());
    this.gridApi.addEventListener('rowDataUpdated', () => this.updateTotals());
  }

  updateTotals() {
    const totals: any = {
      itemName: this.translateService.instant('TABLE_HEADER.TOTALS') + ':',
      quantity: 0,
      unitCostPrice: 0,
      totalCostPrice: 0
    };

    this.gridApi.forEachNodeAfterFilter(node => {
      if (node.data) {
        totals.quantity       += Number(node.data.quantity || 0);
        totals.unitCostPrice  += Number(node.data.unitCostPrice || 0);
        totals.totalCostPrice += Number(node.data.totalCostPrice || 0);
      }
    });

    // this single line creates the perfect totals row
    this.gridApi.setGridOption('pinnedBottomRowData', [totals]);
  }

  private loadingTable(): void
  {
    this.tableLoading = true;

    this.subs.add(
      this.ingredientService.getAll().subscribe((users: any) => {
        this.tableLoading = false;
        this.rowData = users;
        this.cdr.detectChanges();
      })
    );
  }

  private refreshLoadingTable(): void
  {
    this.subs.add(
      this.ingredientService.getAll().subscribe((users: any) => {
        this.rowData = users;
        this.cdr.detectChanges();
      })
    );
  }

  private loadingCards(): void
  {
    this.subs.add(
      this.ingredientService.getCards().subscribe(value => {
        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Qty', this.countUpQty_active, value.activeCount);
          this.countUpRep.onCountUp('countUp-Qty', this.countUpQty_inactive, value.inactiveCount);
          this.countUpRep.onCountUp('countUp-Qty', this.countUpQty_totalActiveQty, value.totalActiveQty);
          this.countUpRep.onCountUp('countUp-Qty', this.countUpQty_nearExpiry, value.nearExpiryCount);
          this.countUpRep.onCountUp('countUp-Qty', this.countUpQty_expired, value.expiredCount);
        }, 300)
      })
    );
  }

  onOpenDialog(): void {
    const payload = {
      format: 'ingredient-create',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }
}
