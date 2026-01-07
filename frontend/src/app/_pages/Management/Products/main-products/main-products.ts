import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, RowSelectionOptions, GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { FormatCurrency, FormatDateByCountryNoTime } from '../../../../_utils/global-methods';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { NotificationHub } from '../../../../_services/notification-hub';
import { ProductService } from '../../../../_services/product-service';
import { BtnTableProduct } from '../btn-table-product/btn-table-product';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-main-products',
  imports: [TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './main-products.html',
  styleUrl: './main-products.scss'
})
export class MainProducts implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
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

  headerHeight = 50;
  rowHeight = 50;

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "singleRow",
    checkboxes: false,
    enableClickSelection: true
  };

  gridOptions: GridOptions = {
    defaultColDef: {
      autoHeight: true,
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
      this.hubNotif.receiveNotifs().subscribe(() => this.refreshLoadingTable())
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
            component: BtnTableProduct,
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
        headerName: this.translateService.instant('TABLE_HEADER.IMAGE'),
        field: 'imageUrl', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          if (params.node.rowPinned === 'bottom')
          { return '' }

          const imageUrl = params.value;
          const itemName = params.data?.itemName || '';
          const initial = itemName.charAt(0).toUpperCase();

          if (imageUrl) {
            return `<img src="${imageUrl}" alt="profile" style="height: 90px; width: 90px; border-radius: 7px; margin: 10px;" />`;
          } else if (itemName) {
            return `
              <div style="
                margin: 10px;
                background-color: #24704d;
                color: white;
                font-size: 3rem;
                font-weight: 100;
                width: 90px;
                height: 90px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 7px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              ">
                ${initial}
              </div>`;
          } else {
            return params.node.rowPinned === 'bottom' ? '' : params.value || '';
          }
        },
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.ITEM_NAME'),
        field: 'itemName', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_start',
        wrapText: true
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.PRICE'),
        field: 'price', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CATEGORY'),
        field: 'category', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return params.node.rowPinned === 'bottom' ? '' : params.value || '';
        },
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
        headerName: this.translateService.instant('TABLE_HEADER.CREATED_AT'),
        field: 'createdAt',
        minWidth: 140,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountryNoTime(params.value);
        }
      }
    ];

    this.loadingData();
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
      itemName: this.translateService.instant('TABLE_HEADER.TOTAL') + ':',
      price: 0,
    };

    this.gridApi.forEachNodeAfterFilter(node => {
      if (node.data) {
        totals.price += Number(node.data.price || 0);
      }
    });

    // this single line creates the perfect totals row
    this.gridApi.setGridOption('pinnedBottomRowData', [totals]);
  }

  private loadingData(): void
  {
    this.tableLoading = true;

    this.subs.add(
      this.productService.getAll().subscribe((products: any) => {
        this.tableLoading = false;
        this.rowData = products;
        this.cdr.detectChanges();
      })
    );
  }

  private refreshLoadingTable(): void
  {
    this.subs.add(
      this.productService.getAll().subscribe((products: any) => {
        this.rowData = products;
        this.cdr.detectChanges();
      })
    );
  }

  onOpenDialog(): void {
    const payload = {
      format: 'product-create',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }
}
