import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, GridApi, GridOptions, GridReadyEvent, RowSelectionOptions } from 'ag-grid-community';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { DialogCreateRepository } from '../../../../_repositories/dialog-create-repository';
import { NotificationHub } from '../../../../_services/notification-hub';
import { FormatQty } from '../../../../_utils/global-methods';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';
import { ProductService } from '../../../../_services/product-service';
import { BtnTableProductIngredient } from '../btn-table-product-ingredient/btn-table-product-ingredient';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-dialog-product-ingredient',
  imports: [Dialog, TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './dialog-product-ingredient.html',
  styleUrl: './dialog-product-ingredient.scss',
})
export class DialogProductIngredient implements OnInit, OnDestroy {
  private dialogUpdateRep = inject(DialogUpdateRepository);
  visible: boolean = false;
  id: string = '';
  itemName: string | undefined = '';

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
    this.subs.add(
      this.dialogUpdateRep.currentDialog$.subscribe(value => {
        if (value.format === 'ingredient_product-view')
        {
          this.visible = value.isVisible;
          this.id = value.id;
          this.itemName = value.name;
          this.loadingData();

          this.subs.add(
            this.hubNotif.receiveNotifs().subscribe(() => {
              this.refreshLoadingTable();
            })
          );
        }
      })
    );

    this.tableData();
    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.tableData();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe() }
    this.dialogUpdateRep.clear();
    this.dialogCreateRep.clear();
  }

  tableData() {
    this.gridOptions.overlayNoRowsTemplate = `<span style="padding: 10px; color: red;">${ this.translateService.instant('COMMON.TABLE.NO_ROWS_TO_SHOWS') }</span>`;

    this.columnDefs =
    [
      {
        headerName: this.translateService.instant('TABLE_HEADER.ACTIONS'),
        field: 'action',
        maxWidth: 110,
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
            component: BtnTableProductIngredient,
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
        field: 'itemName', minWidth: 400, flex: 1,
        cellClass: 'ag_cell_start'
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.QTY'),
        field: 'quantity', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatQty(params.value);
        }
      }
    ];
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
      quantity: 0,
    };

    this.gridApi.forEachNodeAfterFilter(node => {
      if (node.data) {
        totals.quantity += Number(node.data.quantity || 0);
      }
    });

    // this single line creates the perfect totals row
    this.gridApi.setGridOption('pinnedBottomRowData', [totals]);
  }

  private loadingData(): void
  {
    this.tableLoading = true;

    this.subs.add(
      this.productService.getProductIngredient(this.id).subscribe((products: any) => {
        this.tableLoading = false;
        this.rowData = products;
        this.cdr.detectChanges();
      })
    );
  }

  private refreshLoadingTable(): void
  {
    this.subs.add(
      this.productService.getProductIngredient(this.id).subscribe((products: any) => {
        this.rowData = products;
        this.cdr.detectChanges();
      })
    );
  }

  onOpenDialog(): void {
    const payload = {
      format: 'ingredient_product-create',
      isVisible: true,
      id: this.id
    }
    this.dialogCreateRep.send(payload)
  }
}
