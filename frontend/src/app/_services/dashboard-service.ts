import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  //private apiUrl: string = environment.apiUrl;

  constructor (private http: HttpClient) {}

  /*

  DASHBOARD OVERVIEW - GET
  getDashboardOverviewTotalSales = (): Observable<IDashboardOverviewTotalSales> =>
    this.http.get<IDashboardOverviewTotalSales>(`${this.apiUrl}/v1/dashboard-overview/total-sales`);

  getDashboardOverviewTotalGrossBillings = (): Observable<IDashboardOverviewTotalAmounts> =>
      this.http.get<IDashboardOverviewTotalAmounts>(`${this.apiUrl}/v1/dashboard-overview/total-gross-billings`);

  getDashboardOverviewTotalAverageTicket = (): Observable<IDashboardOverviewTotalAmounts> =>
    this.http.get<IDashboardOverviewTotalAmounts>(`${this.apiUrl}/v1/dashboard-overview/total-average-ticket`)

  getDashboardOverviewTotalExpense = (): Observable<IDashboardOverviewTotalAmounts> =>
    this.http.get<IDashboardOverviewTotalAmounts>(`${this.apiUrl}/v1/dashboard-overview/total-expense`);

  getDashboardOverviewTotalNetIncome = (): Observable<IDashboardOverviewTotalAmounts> =>
    this.http.get<IDashboardOverviewTotalAmounts>(`${this.apiUrl}/v1/dashboard-overview/total-net-income`);

  getDashboardOverviewTotalAccountsReceivable = (): Observable<IDashboardOverviewTotalAccounts> =>
    this.http.get<IDashboardOverviewTotalAccounts>(`${this.apiUrl}/v1/dashboard-overview/accounts-receivable`);

  getDashboardOverviewTotalAccountsPayable = (): Observable<IDashboardOverviewTotalAccounts> =>
    this.http.get<IDashboardOverviewTotalAccounts>(`${this.apiUrl}/v1/dashboard-overview/accounts-payable`);

  getDashboardOverviewCarouselPymtMethods = (): Observable<IDashboardOverviewCarouselPaymentMethods> =>
    this.http.get<IDashboardOverviewCarouselPaymentMethods>(`${this.apiUrl}/v1/dashboard-overview/carousel-pymt-methods`);

  getDashoardOverviewChartBillingExpense = (): Observable<IDashboardOverviewChartBillingExpense> =>
    this.http.get<IDashboardOverviewChartBillingExpense>(`${this.apiUrl}/v1/dashboard-overview/chart-billing-expense`)

  */
}
