import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Ripple } from 'primeng/ripple';
import { Subscription, combineLatest, map, BehaviorSubject } from 'rxjs';
import { CountUpRespository } from '../../../../_repositories/count-up-respository';
import { StoredDate } from '../../../../_repositories/stored-date';
import { FormatDateByCountryNoTime, FormatDateByCountry, FormatCurrencyValue, FormatCurrency, formatPhoneNumber, FormatQty } from '../../../../_utils/global-methods';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, LegendComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { AllCommunityModule, ColDef, GridApi, GridOptions, GridReadyEvent, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { ICarouselPymtMethodsDto, PaymentSlide } from '../../../../_interfaces/icarousel-pymt-methods-dto';
import { Carousel } from 'primeng/carousel';
import { OrderStatusEnum } from '../../../../_interfaces/orders-list-dto';
import { AgGridAngular } from "ag-grid-angular";
import { ReportService } from '../../../../_services/report-service';
import { ChartAreaCardRepository } from '../../../../_repositories/Charts/chart-area-card-repository';
import { ChartAreaReportRepository } from '../../../../_repositories/Charts/chart-area-report-repository';
import { ChartAreaReportDTO } from '../../../../_interfaces/chart-area-report-dto';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { RecentSaleDTO, ReportsCardRecentSalesDTO } from '../../../../_interfaces/reports-card-recent-sales-dto';
import { DashboardOrdersCardContent } from "../dashboard-orders-card-content/dashboard-orders-card-content";

echarts.use([LineChart, TitleComponent, LegendComponent, GridComponent, CanvasRenderer, TooltipComponent, LegacyGridContainLabel]);

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-main-dashboard',
  imports: [DatePicker, FloatLabel, FormsModule, Ripple, CommonModule, TranslateModule, CommonModule, NgxEchartsModule, Carousel, AgGridAngular, ScrollPanelModule, DashboardOrdersCardContent],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.scss',
  providers: [provideEchartsCore({echarts})]
})
export class MainDashboard implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly reportService = inject(ReportService);
  private readonly translateService = inject(TranslateService);
  private readonly countUpRep = inject(CountUpRespository);

  private readonly chartCardService = inject(ChartAreaCardRepository);
  private chartAreaRepository = inject(ChartAreaReportRepository);

  private storedDate = inject(StoredDate);
  private subs = new Subscription();

  isActiveBtnToday: boolean = false;
  isActiveBtnYesterday: boolean = false;

  dateValue: Date | null = null;
  dateNow = new Date();
  comparedTo: string = '';
  dateSearch = signal<Date>(new Date)

  // Opening Balance
  @ViewChild('countUpAmount_OpeningBalance', { static: false }) countUpAmount_OpeningBalance!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_OpeningBalance', { static: false }) countUpPct_OpeningBalance!: ElementRef<HTMLElement>;

  private dataCardOpeningBalance$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardOpeningBalance$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardOpeningBalance$ = combineLatest([
    this.dataCardOpeningBalance$,
    this.chartCardOpeningBalance$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardOpeningBalance: EChartsOption = {};

  // Inflows
  @ViewChild('countUpAmount_Inflows', { static: false }) countUpAmount_Inflows!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_Inflows', { static: false }) countUpPct_Inflows!: ElementRef<HTMLElement>;

  private dataCardInflows$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardInflows$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardInflows$ = combineLatest([
    this.dataCardInflows$,
    this.chartCardInflows$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardInflows: EChartsOption = {};

  // Outflows
  @ViewChild('countUpAmount_Outflows', { static: false }) countUpAmount_Outflows!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_Outflows', { static: false }) countUpPct_Outflows!: ElementRef<HTMLElement>;

  private dataCardOutflows$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardOutflows$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardOutflows$ = combineLatest([
    this.dataCardOutflows$,
    this.chartCardOutflows$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardOutflows: EChartsOption = {};

  // Closing Balance
  @ViewChild('countUpAmount_ClosingBalance', { static: false }) countUpAmount_ClosingBalance!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_ClosingBalance', { static: false }) countUpPct_ClosingBalance!: ElementRef<HTMLElement>;

  private dataCardClosingBalance$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardClosingBalance$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardClosingBalance$ = combineLatest([
    this.dataCardClosingBalance$,
    this.chartCardClosingBalance$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardClosingBalance: EChartsOption = {};

  // Number Of Sales
  @ViewChild('countUpAmount_NumOfSales', { static: false }) countUpAmount_NumOfSales!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_NumOfSales', { static: false }) countUpPct_NumOfSales!: ElementRef<HTMLElement>;

  private dataCardNumOfSales$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardNumOfSales$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardNumOfSales$ = combineLatest([
    this.dataCardNumOfSales$,
    this.chartCardNumOfSales$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardNumOfSales: EChartsOption = {};

  // Expected Balance
  @ViewChild('countUpAmount_ExpectedBalance', { static: false }) countUpAmount_ExpectedBalance!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_ExpectedBalance', { static: false }) countUpPct_ExpectedBalance!: ElementRef<HTMLElement>;

  private dataCardExpectedBalance$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardExpectedBalance$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardExpectedBalance$ = combineLatest([
    this.dataCardExpectedBalance$,
    this.chartCardExpectedBalance$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardExpectedBalance: EChartsOption = {};

  // Average Ticket
  @ViewChild('countUpAmount_AverageTicket', { static: false }) countUpAmount_AverageTicket!: ElementRef<HTMLElement>;
  @ViewChild('countUpPct_AverageTicket', { static: false }) countUpPct_AverageTicket!: ElementRef<HTMLElement>;

  private dataCardAverageTicket$ = new BehaviorSubject<PayloadAmount>({
    trendPercentage: 0,
    lastUpdated: new Date()
  });
  private chartCardAverageTicket$ = new BehaviorSubject<PayloadChart>({
    charAmount: [],
    chartDate: []
  });
  combineCardAverageTicket$ = combineLatest([
    this.dataCardAverageTicket$,
    this.chartCardAverageTicket$
  ]).pipe(
    map(([data, chart]) => ({ data, chart }))
  );
  chartOptionCardAverageTicket: EChartsOption = {};

  // Sales by Payment Method
  carouselPymtMethod$ = new BehaviorSubject<ICarouselPymtMethodsDto>({
    slides: []
  });

  // Chart Area - Sales per hour
  optionChartAreaSale$ = new BehaviorSubject<ChartAreaReportDTO>({
    amounts: [],
    date: []
  });
  optionChartAreaSale: EChartsOption = {};

  // Recent Sales
  sales$ = new BehaviorSubject<ReportsCardRecentSalesDTO[]>([]);

  // tables
  tableLoadingCashMovmts: boolean = false;
  columnDefsCashMovmts: ColDef[] = [];
  rowDataCashMovmts: any[] = [];

  tableLoading: boolean = false;
  columnDefs: ColDef[] = [];
  rowData: any[] = [];

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

  formatDateByCountryNoTime = FormatDateByCountryNoTime;
  formatDateByCountry = FormatDateByCountry;
  formatCurrencyValue = FormatCurrencyValue;

  ngOnInit(): void {
    this.onToggleDateBtn('btn_today');

    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.subs.add(
          this.storedDate.currentDate$.subscribe(value => {
            this.checkCompared(value.start);
          })
        );
      })
    );

    this.tableData();
    this.subs.add(
      this.translateService.onLangChange.subscribe(() => {
        this.tableData();
      })
    );
  }

  ngAfterViewInit() {
    this.onToggleDateBtn('btn_today');
  }

  ngOnDestroy(): void {
    if (this.subs) { this.subs.unsubscribe() }
  }

  onToggleDateBtn(format: string)
  {
    switch (format)
    {
      case 'btn_today':
        this.isActiveBtn('btn_today');
        this.onSearchDate(this.dateNow)
        break;
      case 'btn_yesterday':
        this.isActiveBtn('btn_yesterday');
        const yesterday = new Date(this.dateNow);
        yesterday.setDate(this.dateNow.getDate() - 1);
        this.onSearchDate(yesterday);
        break;
      default:
        console.error('Unsuported format: ',format);
        break;
    }

    this.dateValue = null;
  }

  onDateChange() {
    const date = this.dateValue;

    if (date) {
      this.isActiveBtn('btn_reset_all');
      this.onSearchDate(date);
    }
  }

  checkCompared(startDate?: Date): void {
    const today = onlyDate(this.dateNow);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    const start = startDate ? onlyDate(startDate) : undefined;

    if (start?.getTime() === today.getTime())
    {
      this.comparedTo = this.translateService.instant('COMMON.CARD.COMPARED_TO_YESTERDAY');
    }
    else if (start?.getTime() === yesterday.getTime()) {
      this.comparedTo = this.translateService.instant('COMMON.CARD.COMPARED_TO_DAY_BEFORE_YESTERDAY');
    }
    else {
      this.comparedTo = this.comparedTo = this.translateService.instant('COMMON.CARD.COMPARED_TO_LAST');
    }
  }

  isActiveBtn(format: string) {
    if (format === 'btn_today') { this.isActiveBtnToday = true; }
    else { this.isActiveBtnToday = false; }

    if (format === 'btn_yesterday') { this.isActiveBtnYesterday = true; }
    else { this.isActiveBtnYesterday = false; }

    if (format === 'btn_reset_all')
    {
      this.isActiveBtnToday = false;
      this.isActiveBtnYesterday = false;
    }
  }

  onSearchDate(date: Date)
  {
    this.dateSearch.set(date);

    const currentFormatDate = formatDateToYYYYMMDD(date);

    const previous = new Date(date);
    previous.setDate(date.getDate() - 1);
    const previousFormatDate = formatDateToYYYYMMDD(previous);

    const payloadSingle: DateDTO = { date: currentFormatDate }
    const payloadCards: DateDTO = {
      previousDate: previousFormatDate,
      currentDate: currentFormatDate
    }


    if (date)
    {
      const stored = {
        start: date,
        end: undefined
      }
      this.storedDate.setStoredDate(stored)
      this.checkCompared(date);

      this.loadingCards(payloadCards);
      this.loadingTablesData(payloadSingle);
      this.loadingPaymentMethod(payloadSingle);

      // Chart Area - Sales per hour
      this.subs.add(
        this.reportService.getChartSalesPerHour(payloadSingle).subscribe(raw => {
          const response = Array.isArray(raw) ? raw : [];
          const firstItem = response[0] || {};

          // CORRECT PROPERTY NAMES: amounts & date (not charAmount/chartDate)
          const amounts = Array.isArray(firstItem.amounts)
            ? firstItem.amounts.map((n: any) => Number(n) || 0)
            : [];

          const date = Array.isArray(firstItem.date)
            ? firstItem.date
            : [];

          this.optionChartAreaSale$.next({ amounts, date });
        })
      );

      // Recent Sales
      this.subs.add(
        this.reportService.getRecentSales(payloadSingle).subscribe(resp => {
          //console.log('response: ', resp);
          // Wrap single object in an array
          this.sales$.next(Array.isArray(resp) ? resp : [resp]);
        })
      );

      this.loadChartData();
    }
  }

  loadingCards(date: DateDTO): void
  {
    // Opening Balance
    this.subs.add(
      this.reportService.getInitialBalance(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardOpeningBalance$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardOpeningBalance$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_OpeningBalance, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_OpeningBalance, item.trendPercentage);
        })
      })
    );

    // Inflows
    this.subs.add(
      this.reportService.getInflows(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardInflows$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardInflows$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_Inflows, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_Inflows, item.trendPercentage);
        }, 500)
      })
    );

    // Outflows
    this.subs.add(
      this.reportService.getOutflows(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardOutflows$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardOutflows$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_Outflows, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_Outflows, item.trendPercentage);
        }, 500)
      })
    );

    // Closing Balance
    this.subs.add(
      this.reportService.getClosingBalance(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardClosingBalance$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardClosingBalance$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_ClosingBalance, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_ClosingBalance, item.trendPercentage);
        }, 500)
      })
    );

    // Number Of Sales
    this.subs.add(
      this.reportService.getNumOfSales(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardNumOfSales$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardNumOfSales$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Qty', this.countUpAmount_NumOfSales, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_NumOfSales, item.trendPercentage);
        }, 500)
      })
    );

    // Expected Balance
    this.subs.add(
      this.reportService.getExpectedBalance(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardExpectedBalance$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardExpectedBalance$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_ExpectedBalance, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_ExpectedBalance, item.trendPercentage);
        }, 500)
      })
    );

    // Average Ticket
    this.subs.add(
      this.reportService.getAverageTicket(date).subscribe(value => {
        const item = Array.isArray(value) ? value[0] : value;
        this.dataCardAverageTicket$.next({
          trendPercentage: item.trendPercentage,
          lastUpdated: item.lastUpdated
        });

        this.chartCardAverageTicket$.next({
          charAmount: item.chartAmount,
          chartDate: item.chartDate
        });

        setTimeout(() => {
          this.countUpRep.onCountUp('countUp-Amount', this.countUpAmount_AverageTicket, item.totalAmount);
          this.countUpRep.onCountUp('countUp-Percentage', this.countUpPct_AverageTicket, item.trendPercentage);
        }, 500)
      })
    );
  }

  loadingTablesData(date: DateDTO): void
  {
    this.tableLoadingCashMovmts = true;

    this.subs.add(
      this.reportService.getCashMovements(date).subscribe((data: any) => {
        this.rowDataCashMovmts = data;
        this.tableLoadingCashMovmts = false;
        this.cdr.detectChanges();
      })
    );

    this.tableLoading = true;

    this.subs.add(
      this.reportService.getOrdersDetail(date).subscribe((data: any) => {
        this.rowData = data;
        this.tableLoading = false;
        this.cdr.detectChanges();
      })
    );
  }

  loadChartData() {
    // Opening Balance
    this.combineCardOpeningBalance$ = combineLatest([
      this.dataCardOpeningBalance$,
      this.chartCardOpeningBalance$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardOpeningBalance$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardOpeningBalance = this.chartCardService.getChartConfig('openingBalance', data);
        })
    );

    // Inflows
    this.combineCardInflows$ = combineLatest([
      this.dataCardInflows$,
      this.chartCardInflows$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardInflows$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardInflows = this.chartCardService.getChartConfig('inflows', data);
        })
    );

    // Outflows
    this.combineCardOutflows$ = combineLatest([
      this.dataCardOutflows$,
      this.chartCardOutflows$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardOutflows$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardOutflows = this.chartCardService.getChartConfig('outflows', data);
        })
    );

    // Closing Balance
    this.combineCardClosingBalance$ = combineLatest([
      this.dataCardClosingBalance$,
      this.chartCardClosingBalance$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardClosingBalance$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardClosingBalance = this.chartCardService.getChartConfig('closingBalance', data);
        })
    );

    // Number Of Sales
    this.combineCardNumOfSales$ = combineLatest([
      this.dataCardNumOfSales$,
      this.chartCardNumOfSales$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardNumOfSales$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardNumOfSales = this.chartCardService.getChartConfig('numOfSales', data);
        })
    );

    // Expected Balance
    this.combineCardExpectedBalance$ = combineLatest([
      this.dataCardExpectedBalance$,
      this.chartCardExpectedBalance$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardExpectedBalance$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardExpectedBalance = this.chartCardService.getChartConfig('expectedBalance', data);
        })
    );

    // Average Ticket
    this.combineCardAverageTicket$ = combineLatest([
      this.dataCardAverageTicket$,
      this.chartCardAverageTicket$
    ]).pipe(
      map(([data, chart]) => ({ data, chart }))
    );

    this.subs.add(
      this.chartCardAverageTicket$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.chartOptionCardAverageTicket = this.chartCardService.getChartConfig('averageTicket', data);
        })
    );

    // Chart Area - Sales per hour
    this.subs.add(
      this.optionChartAreaSale$
        .pipe(
          map(data => ({ data }))
        )
        .subscribe(({data}) => {
          this.optionChartAreaSale = this.chartAreaRepository.getChartConfig(data);
        })
    );
  }

  tableData() {
    this.gridOptions.overlayNoRowsTemplate = `<span style="padding: 10px; color: red;">${ this.translateService.instant('COMMON.TABLE.NO_ROWS_TO_SHOWS') }</span>`;

    this.columnDefsCashMovmts =
    [
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
        headerName: this.translateService.instant('TABLE_HEADER.TYPE.TITLE'),
        field: 'cashName', minWidth: 90, flex: 1,
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
        field: 'amount', minWidth: 90, flex: 1,
        cellClass: 'ag_cell_end',
        cellRenderer: (params: any) => {
          return FormatCurrency(params.value);
        }
      },
      {
        headerName: this.translateService.instant('TABLE_HEADER.DESCRIPTION'),
        field: 'description', minWidth: 300, flex: 1,
        cellClass: 'ag_cell_center',
        wrapText: true,
        autoHeight: true
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

    this.columnDefs =
    [
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
            <span class="px-2 py-1 rounded-[7px] text-[12pt] font-normal border-1 ${state.color}">
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

  loadingPaymentMethod(date: DateDTO): void
  {
    this.subs.add(
      this.reportService.getPymtMethod(date).subscribe(response => {
        let amounts: number[] = [0, 0, 0];

        // A API retorna um array com um objeto que tem a propriedade "amounts"
        if (Array.isArray(response) && response.length > 0) {
          const firstItem = response[0];
          if (firstItem && Array.isArray(firstItem.amounts)) {
            amounts = firstItem.amounts.map((n: any) => Number(n) || 0);
          }
        }

        // Garante exatamente 3 posições
        amounts = [...amounts.slice(0, 3), 0, 0, 0].slice(0, 3);

        const slides: PaymentSlide[] = [
          { imageUrl: '/assets/images/cash_pt.png', amount: amounts[0] },
          { imageUrl: '/assets/images/e-mola_logo.png', amount: amounts[1] },
          { imageUrl: '/assets/images/m-pesa_logo.png', amount: amounts[2] }
        ];

        this.carouselPymtMethod$.next({ slides });
      })
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}

function onlyDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // zera horas, minutos, segundos e milissegundos
  return d;
}

function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

interface DateDTO {
  date?: string,
  previousDate?: string,
  currentDate?: string
}

interface PayloadAmount {
  trendPercentage: number
  lastUpdated: Date
}

interface PayloadChart {
  charAmount: number[]
  chartDate: string[]
}
