import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { DialogUpdateRepository } from '../../../../_repositories/dialog-update-repository';
import { CashRegisterService } from '../../../../_services/cash-register-service';
import { NotificationHub } from '../../../../_services/notification-hub';
import { FormatCurrency, FormatDateByCountry } from '../../../../_utils/global-methods';
import { ModuleRegistry, AllCommunityModule, ColDef, RowSelectionOptions, GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { BtnTableDetailCashRegister } from '../btn-table-detail-cash-register/btn-table-detail-cash-register';

ModuleRegistry.registerModules([ AllCommunityModule ]);

@Component({
  selector: 'app-details-cash-register-dialog',
  imports: [Dialog, TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './details-cash-register-dialog.html',
  styleUrl: './details-cash-register-dialog.scss',
})
export class DetailsCashRegisterDialog implements OnInit, OnDestroy {
  private dialogUpdateRep = inject(DialogUpdateRepository);
  visible: boolean = false;
  id: string = '';
  itemName: string | undefined = '';

  private readonly cashRegstService = inject(CashRegisterService);
  private readonly hubNotif = inject(NotificationHub);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly subs = new Subscription();

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
        if (value.format === 'cash_register-details')
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
  }

  tableData() {
    this.gridOptions.overlayNoRowsTemplate = `<span style="padding: 10px; color: red;">${ this.translateService.instant('COMMON.TABLE.NO_ROWS_TO_SHOWS') }</span>`;

    this.columnDefs =
    [
      {
        headerName: this.translateService.instant('TABLE_HEADER.ACTIONS'),
        minWidth: 70, flex: 1,
        cellClass: 'ag_cell_center',
        cellRendererSelector: (params: any) => {
          if (params.node.rowPinned === 'bottom') {
            return {
              component: null,
              params: null
            };
          }

          return {
            component: BtnTableDetailCashRegister,
            params: { ...params }
          };
        }
      },
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        cellClass: 'ag_cell_row_index'
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.TYPE.TITLE'),
        field: 'cashName', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_start',
        cellRenderer: (params: any) => {
          const map: any = {
            'opened':  { label: this.translateService.instant('TABLE_HEADER.TYPE.OPTIONS.OPENED') },
            'closed': { label: this.translateService.instant('TABLE_HEADER.TYPE.OPTIONS.CLOSED') },
            'cash in': { label: this.translateService.instant('TABLE_HEADER.TYPE.OPTIONS.REINFORCEMENT') },
            'cash out': { label: this.translateService.instant('TABLE_HEADER.TYPE.OPTIONS.WITHDRAWAL') }
          };

          if (!map[params.value]) {
            return '';
          }

          const state = map[params.value];

          return state.label;
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.AMOUNT_MT'),
        field: 'amount', minWidth: 150, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.DESCRIPTION'),
        field: 'description', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_center',
        wrapText: true
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.STATUS.TITLE'),
        field: 'status',
        minWidth: 120,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          const map: any = {
            true:  { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.CONFIRMED'),   color: "status_green" },
            false: { label: this.translateService.instant('TABLE_HEADER.STATUS.OPTIONS.CANCELLED'), color: "status_red" }
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
        minWidth: 200,
        flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountry(params.value);
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
  }

  private loadingData(): void
  {
    this.tableLoading = true;

    this.subs.add(
      this.cashRegstService.getAllDetails(this.id).subscribe((data: any) => {
        this.tableLoading = false;
        this.rowData = data;
        this.cdr.detectChanges();
      })
    );
  }

  private refreshLoadingTable(): void
  {
    this.subs.add(
      this.cashRegstService.getAllDetails(this.id).subscribe((data: any) => {
        this.rowData = data;
        this.cdr.detectChanges();
      })
    );
  }
}
