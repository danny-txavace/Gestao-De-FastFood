import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef, RowSelectionOptions, GridOptions, GridApi } from 'ag-grid-community';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../_services/user-service';
import { FormatDateByCountryNoTime, formatPhoneNumber } from '../../../../../_utils/global-methods';
import { NotificationHub } from '../../../../../_services/notification-hub';
import { BtnTableUser } from '../btn-table-user/btn-table-user';
import { DialogCreateRepository } from '../../../../../_repositories/dialog-create-repository';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-main-system-users',
  imports: [TranslateModule, Ripple, FloatLabel, FormsModule, AgGridAngular, InputIcon, IconField, ReactiveFormsModule, InputTextModule],
  templateUrl: './main-system-users.html',
  styleUrl: './main-system-users.scss'
})
export class MainSystemUsers implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
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
        cellRenderer: BtnTableUser,
        cellClass: 'ag_cell_center'
      },
      {
        headerName: '#',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        cellClass: 'ag_cell_row_index'
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.IMAGE'),
        field: 'image', minWidth: 60, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          const imageUrl = params.value;
          const username = params.data?.username || '';
          const initial = username.charAt(0).toUpperCase();

          if (imageUrl) {
            return `<img src="${imageUrl}" alt="profile" style="height: 30px; width: 30px; border-radius: 50%;" />`;
          } else {
            return `
              <div style="
                background-color: #24704d;
                color: white;
                font-size: 16px;
                font-weight: 500;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              ">
                ${initial}
              </div>`;
          }
        },
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.USERNAME'),
        field: 'username', minWidth: 200, flex: 1,
        cellClass: 'ag_cell_start'
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.CUSTOMER_PHONE'),
        field: 'phoneNumber', minWidth: 170, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return formatPhoneNumber(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.ROLE'),
        field: 'roles', minWidth: 70, flex: 1,
        cellClass: 'ag_cell_center'
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.STATUS.TITLE'),
        field: 'isActive',
        minWidth: 100,
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
        field: 'createdAt', minWidth: 100, flex: 1,
        cellClass: 'ag_cell_center',
        cellRenderer: (params: any) => {
          return FormatDateByCountryNoTime(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.LAST_UPDATE'),
        field: 'updatedAt', minWidth: 100, flex: 1,
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

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  private loadingData(): void
  {
    this.tableLoading = true;
    this.subs.add(
      this.userService.getAll().subscribe((users: any) => {
        this.tableLoading = false;
        this.rowData = users;
        this.cdr.detectChanges();
      })
    );
  }

  private refreshDataWithoutLoader(): void
  {
    this.subs.add(
      this.userService.getAll().subscribe((users: any) => {
        this.rowData = users;
        this.cdr.detectChanges();
      })
    );
  }

  onOpenDialog(): void {
    const payload = {
      format: 'user-create',
      isVisible: true
    }
    this.dialogCreateRep.send(payload)
  }
}
