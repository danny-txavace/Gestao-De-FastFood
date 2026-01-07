import { inject, Injectable } from '@angular/core';
import { ReportsCashMovementsDTO } from '../_interfaces/reports-cash-movements-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { OrdersListDTO } from '../_interfaces/orders-list-dto';
import { ReportsCardDTO } from '../_interfaces/reports-card-dto';
import { PaymnetMethodDTO } from '../_interfaces/icarousel-pymt-methods-dto';
import { ChartAreaReportDTO } from '../_interfaces/chart-area-report-dto';
import { RecentSaleDTO, ReportsCardRecentSalesDTO } from '../_interfaces/reports-card-recent-sales-dto';

interface DateDTO {
  date?: string,
  previousDate?: string,
  currentDate?: string
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly api = `${environment.myUrl}/api/Reports`;
  private readonly http = inject(HttpClient);

  getCashMovements = (date: DateDTO) : Observable<ReportsCashMovementsDTO> => this.http.post<ReportsCashMovementsDTO>(`${this.api}/v1/get-cash-movements`, date);

  getOrdersDetail = (date: DateDTO) : Observable<OrdersListDTO> => this.http.post<OrdersListDTO>(`${this.api}/v1/get-orders-detail`, date);

  getInitialBalance = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-initial-balance`, date);

  getInflows = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-inflows`, date);

  getOutflows = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-outflows`, date);

  getClosingBalance = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-closing-balance`, date);

  getNumOfSales = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-num-of-sales`, date);

  getExpectedBalance = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-expected-balance`, date);

  getAverageTicket = (date: DateDTO) : Observable<ReportsCardDTO> => this.http.post<ReportsCardDTO>(`${this.api}/v1/get-average-ticket`, date);

  getPymtMethod = (date: DateDTO) : Observable<PaymnetMethodDTO> => this.http.post<PaymnetMethodDTO>(`${this.api}/v1/get-pymt-method`, date);

  getChartSalesPerHour = (date: DateDTO) : Observable<ChartAreaReportDTO> => this.http.post<ChartAreaReportDTO>(`${this.api}/v1/get-chart-sales-per-hour`, date);

  getRecentSales = (date: DateDTO) : Observable<ReportsCardRecentSalesDTO> => this.http.post<ReportsCardRecentSalesDTO>(`${this.api}/v1/get-recent-sales`, date);
}
