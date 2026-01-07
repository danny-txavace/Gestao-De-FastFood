import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of } from 'rxjs';
import { IDashboardSalesTransactionDto } from '../_interfaces/Dashboard/idashboard-sales-transaction-dto';
import { IDashboardTotalBalanceDto } from '../_interfaces/Dashboard/idashboard-total-balance-dto';
import { IChartAreaRevenueExpenseDto } from '../_interfaces/Charts/ichart-area-revenue-expense-dto';
import { IChartPieSalesCategoryDto } from '../_interfaces/Charts/ichart-pie-sales-category-dto';
import { ICarouselPymtMethodsDto } from '../_interfaces/icarousel-pymt-methods-dto';
import { ITotalValueDto } from '../_interfaces/itotal-value-dto';
import { IDashboardSalesByProductDto } from '../_interfaces/Dashboard/idashboard-sales-by-product-dto';
import { IDashboardRegisterStatusDto } from '../_interfaces/Dashboard/idashboard-register-status-dto';
import { ICashRegisterDto } from '../_interfaces/icash-register-dto';

@Injectable({
  providedIn: 'root'
})
export class DashboardServiceMock {
  private lastUpdate: Date = new Date();

  // DASHBOARD OVERVIEW
  getDOtotalBalance(lang: string): Observable<IDashboardTotalBalanceDto>
  {
    return of().pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Total Balance. \nMore details: ',err);
        throw err;
      })
    )
  }

  getDOchartAreaRevenueExpense(): Observable<IChartAreaRevenueExpenseDto>
  {
    const startDate = new Date(2025, 0, 7);
    const endDate = new Date(2026, 4, 15);
    const date: string[] = [];
    const revenue: number[] = [];
    const expense: number[] = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      date.push(currentDate.toISOString());
      revenue.push(Math.floor(Math.random() * 17000));
      expense.push(Math.floor(Math.random() * 7800));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const data: IChartAreaRevenueExpenseDto = {
      date: date,
      revenue: revenue,
      expense: expense
    }

    return of(data).pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Chart revenue/expense.\nMore details: ', err)
        throw err;
      })
    );
  }

  getDOTotalOrders(): Observable<ITotalValueDto> {
    const datas: ITotalValueDto = {
      totalValue: 24,
      percentage: 1,
      lastUpdate: this.lastUpdate
    }

    return of(datas).pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Total sales.\nMore details: ',err)
        throw err;
      })
    )
  }

  getDOTotalSales(): Observable<ITotalValueDto> {
    const datas: ITotalValueDto = {
      totalValue: 1250,
      percentage: 13,
      lastUpdate: this.lastUpdate
    }

    return of(datas).pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Total sales.\nMore details: ',err)
        throw err;
      })
    )
  }

  getDOTotalAmount(): Observable<ITotalValueDto> {
    const datas: ITotalValueDto = {
      totalValue: 50400.23,
      percentage: -2,
      lastUpdate: this.lastUpdate
    }

    return of(datas).pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Total amount.\nMore details: ',err)
        throw err;
      })
    )
  }

  getDOsalesPaymentMethod(lang: string): Observable<ICarouselPymtMethodsDto>
  {

    return of().pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Total Balance. \nMore details: ',err);
        throw err;
      })
    )
  }

  getDOchartPieSalesCategory(): Observable<IChartPieSalesCategoryDto> {
    const data: IChartPieSalesCategoryDto = {
      category: ['Desktop', 'Laptop', 'Monitor', 'Teclado', 'Mouse', 'Desk', 'Tools', 'Door'],
      totalAmount: [27500, 76000, 12000, 4300, 9000, 23000, 1500, 89000],
      totalQty: [12, 1450004, 41, 18, 32, 35, 88, 120000]
    }

    return of(data).pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-overview: Chart financial overview.\nMore details: ', err)
        throw err;
      })
    )
  }



  // DASHBOARD SALES
  private datasetSaleAmount: ITotalValueDto[] = [
    { totalValue: 500, percentage: 7, lastUpdate: new Date('2025-12-03T08:00:00') },
    { totalValue: 2500, percentage: 7, lastUpdate: new Date('2025-12-04T09:30:00') },
    { totalValue: 7500, percentage: 7, lastUpdate: new Date('2025-08-03T11:15:00') },
    { totalValue: 120000, percentage: 7, lastUpdate: new Date('2025-08-04T14:45:00') },
    { totalValue: 90000, percentage: 7, lastUpdate: new Date('2025-08-05T16:10:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-08-06T07:50:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-08-07T08:05:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-08-08T09:25:00') },
    { totalValue: 200000, percentage: 7, lastUpdate: new Date('2025-08-09T12:30:00') },
    { totalValue: 50000, percentage: 7, lastUpdate: new Date('2025-08-10T10:05:00') },
    { totalValue: 750, percentage: 7, lastUpdate: new Date('2025-09-01T08:50:00') },
    { totalValue: 3000, percentage: 7, lastUpdate: new Date('2025-09-02T14:15:00') },
    { totalValue: 100000, percentage: 7, lastUpdate: new Date('2025-09-03T18:30:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-09-04T07:10:00') },
    { totalValue: 50000, percentage: 7, lastUpdate: new Date('2025-09-05T12:25:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-09-06T09:40:00') },
    { totalValue: 750000, percentage: 7, lastUpdate: new Date('2025-09-07T15:55:00') },
    { totalValue: 2500, percentage: 7, lastUpdate: new Date('2025-09-08T11:05:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-09-09T13:20:00') },
    { totalValue: 500, percentage: 7, lastUpdate: new Date('2025-09-10T13:20:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-09-11T10:21:00') },
    { totalValue: 600, percentage: 7, lastUpdate: new Date('2025-09-12T09:15:00') },
    { totalValue: 3000, percentage: 7, lastUpdate: new Date('2025-09-13T14:40:00') },
    { totalValue: 170000, percentage: 7, lastUpdate: new Date('2025-09-14T16:05:00') },
    { totalValue: 250000, percentage: 7, lastUpdate: new Date('2025-09-15T08:30:00') },
    { totalValue: 20000, percentage: 7, lastUpdate: new Date('2025-09-16T12:55:00') },
    { totalValue: 4000, percentage: 7, lastUpdate: new Date('2025-09-17T11:20:00') },
    { totalValue: 2000, percentage: 7, lastUpdate: new Date('2025-09-18T15:45:00') },
    { totalValue: 5000, percentage: 7, lastUpdate: new Date('2025-09-19T10:10:00') },
    { totalValue: 1000, percentage: 7, lastUpdate: new Date('2025-09-20T09:35:00') },
    { totalValue: 70000, percentage: 7, lastUpdate: new Date('2025-09-21T14:50:00') }
  ];


  setDSProduct(startDate?: Date, endDate?: Date): Observable<IDashboardSalesByProductDto[]> {
    const salesData: IDashboardSalesByProductDto[] = [
      { code: 'PRD-001', itemName: 'Product A', quantity: 2, totalAmount: 200, date: '2025-09-20' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 1, totalAmount: 120, date: '2025-09-21' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 3, totalAmount: 180, date: '2025-09-22' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 1, totalAmount: 100, date: '2025-09-23' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 240, date: '2025-09-24' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 1, totalAmount: 60, date: '2025-09-25' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 4, totalAmount: 400, date: '2025-09-26' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 160, date: '2025-09-27' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 3, totalAmount: 210, date: '2025-09-28' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 1, totalAmount: 100, date: '2025-09-29' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 160, date: '2025-09-30' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 1, totalAmount: 60, date: '2025-10-01' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 3, totalAmount: 300, date: '2025-10-02' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 200, date: '2025-10-03' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 1, totalAmount: 70, date: '2025-10-04' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 2, totalAmount: 200, date: '2025-10-05' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 1, totalAmount: 100, date: '2025-10-06' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 3, totalAmount: 180, date: '2025-10-07' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 1, totalAmount: 100, date: '2025-10-08' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 160, date: '2025-10-09' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 3, totalAmount: 210, date: '2025-10-10' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 1, totalAmount: 100, date: '2025-10-11' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 200, date: '2025-10-12' },
      { code: 'PRD-003', itemName: 'Product C', quantity: 1, totalAmount: 70, date: '2025-10-13' },
      { code: 'PRD-001', itemName: 'Product A', quantity: 3, totalAmount: 300, date: '2025-10-14' },
      { code: 'PRD-002', itemName: 'Product B', quantity: 2, totalAmount: 160, date: '2025-10-15' }
    ];

    // Converter datas do array para Date
    const normalized = salesData.map(d => ({
      ...d,
      lastUpdate: new Date(d.date)
    }));

    let start: Date | undefined = startDate ? new Date(startDate) : undefined;
    let end: Date | undefined = endDate ? new Date(endDate) : undefined;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
    if (start && !end) end = new Date(start.getTime()); // se só enviar start, end = start
    if (start && end && end < start) end = new Date(start.getTime()); // garantir intervalo válido

    // Filtrar pelo intervalo
    const result = (start && end)
      ? normalized.filter(d => {
          const t = d.lastUpdate.getTime();
          return t >= start!.getTime() && t <= end!.getTime();
        })
      : normalized;

    return of(result).pipe(
      delay(500), // simula carregamento
      catchError(err => {
        console.error('Error loading dashboard sales transactions:', err);
        throw err;
      })
    );
  }

  setDSTransactions(startDate?: Date, endDate?: Date): Observable<IDashboardSalesTransactionDto[]> {
    const salesData: IDashboardSalesTransactionDto[] = [
      { operator: 'Alice', code: 'TX-20250920', itemName: 'Product A', quantity: 2, unitPrice: 100, discount: 5, addition: 0, totalAmount: 195, paymentMethod: 'Cash', status: 'Paid', date: '2025-09-20' },
      { operator: 'Bob', code: 'TX-20250921', itemName: 'Product B', quantity: 1, unitPrice: 80, discount: 0, addition: 0, totalAmount: 80, paymentMethod: 'Card', status: 'Pending', date: '2025-09-21' },
      { operator: 'Carol', code: 'TX-20250922', itemName: 'Product C', quantity: 3, unitPrice: 60, discount: 10, addition: 5, totalAmount: 185, paymentMethod: 'Cash', status: 'Paid', date: '2025-09-22' },
      { operator: 'Alice', code: 'TX-20250923', itemName: 'Product A', quantity: 1, unitPrice: 100, discount: 0, addition: 0, totalAmount: 100, paymentMethod: 'Transfer', status: 'Cancelled', date: '2025-09-23' },
      { operator: 'Bob', code: 'TX-20250924', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 5, addition: 0, totalAmount: 155, paymentMethod: 'Card', status: 'Paid', date: '2025-09-24' },
      { operator: 'Carol', code: 'TX-20250925', itemName: 'Product C', quantity: 1, unitPrice: 60, discount: 0, addition: 0, totalAmount: 60, paymentMethod: 'Cash', status: 'Pending', date: '2025-09-25' },
      { operator: 'Alice', code: 'TX-20250926', itemName: 'Product A', quantity: 4, unitPrice: 100, discount: 10, addition: 0, totalAmount: 390, paymentMethod: 'Cash', status: 'Paid', date: '2025-09-26' },
      { operator: 'Bob', code: 'TX-20250927', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 0, addition: 0, totalAmount: 160, paymentMethod: 'Card', status: 'Pending', date: '2025-09-27' },
      { operator: 'Carol', code: 'TX-20250928', itemName: 'Product C', quantity: 3, unitPrice: 60, discount: 5, addition: 0, totalAmount: 175, paymentMethod: 'Transfer', status: 'Paid', date: '2025-09-28' },
      { operator: 'Alice', code: 'TX-20250929', itemName: 'Product A', quantity: 1, unitPrice: 100, discount: 0, addition: 0, totalAmount: 100, paymentMethod: 'Cash', status: 'Cancelled', date: '2025-09-29' },
      { operator: 'Bob', code: 'TX-20250930', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 5, addition: 0, totalAmount: 155, paymentMethod: 'Card', status: 'Paid', date: '2025-09-30' },
      { operator: 'Carol', code: 'TX-20251001', itemName: 'Product C', quantity: 1, unitPrice: 60, discount: 0, addition: 0, totalAmount: 60, paymentMethod: 'Cash', status: 'Pending', date: '2025-10-01' },
      { operator: 'Alice', code: 'TX-20251002', itemName: 'Product A', quantity: 3, unitPrice: 100, discount: 15, addition: 5, totalAmount: 290, paymentMethod: 'Transfer', status: 'Paid', date: '2025-10-02' },
      { operator: 'Bob', code: 'TX-20251003', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 0, addition: 0, totalAmount: 160, paymentMethod: 'Card', status: 'Pending', date: '2025-10-03' },
      { operator: 'Carol', code: 'TX-20251004', itemName: 'Product C', quantity: 1, unitPrice: 60, discount: 0, addition: 0, totalAmount: 60, paymentMethod: 'Cash', status: 'Paid', date: '2025-10-04' },
      { operator: 'Alice', code: 'TX-20251005', itemName: 'Product A', quantity: 2, unitPrice: 100, discount: 5, addition: 0, totalAmount: 195, paymentMethod: 'Transfer', status: 'Cancelled', date: '2025-10-05' },
      { operator: 'Bob', code: 'TX-20251006', itemName: 'Product B', quantity: 1, unitPrice: 80, discount: 0, addition: 0, totalAmount: 80, paymentMethod: 'Card', status: 'Paid', date: '2025-10-06' },
      { operator: 'Carol', code: 'TX-20251007', itemName: 'Product C', quantity: 3, unitPrice: 60, discount: 5, addition: 0, totalAmount: 175, paymentMethod: 'Cash', status: 'Pending', date: '2025-10-07' },
      { operator: 'Alice', code: 'TX-20251008', itemName: 'Product A', quantity: 1, unitPrice: 100, discount: 0, addition: 0, totalAmount: 100, paymentMethod: 'Transfer', status: 'Paid', date: '2025-10-08' },
      { operator: 'Bob', code: 'TX-20251009', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 0, addition: 0, totalAmount: 160, paymentMethod: 'Card', status: 'Cancelled', date: '2025-10-09' },
      { operator: 'Carol', code: 'TX-20251010', itemName: 'Product C', quantity: 3, unitPrice: 60, discount: 10, addition: 5, totalAmount: 185, paymentMethod: 'Cash', status: 'Paid', date: '2025-10-10' },
      { operator: 'Alice', code: 'TX-20251011', itemName: 'Product A', quantity: 1, unitPrice: 100, discount: 0, addition: 0, totalAmount: 100, paymentMethod: 'Transfer', status: 'Pending', date: '2025-10-11' },
      { operator: 'Bob', code: 'TX-20251012', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 5, addition: 0, totalAmount: 155, paymentMethod: 'Card', status: 'Paid', date: '2025-10-12' },
      { operator: 'Carol', code: 'TX-20251013', itemName: 'Product C', quantity: 1, unitPrice: 60, discount: 0, addition: 0, totalAmount: 60, paymentMethod: 'Cash', status: 'Pending', date: '2025-10-13' },
      { operator: 'Alice', code: 'TX-20251014', itemName: 'Product A', quantity: 3, unitPrice: 100, discount: 10, addition: 0, totalAmount: 290, paymentMethod: 'Transfer', status: 'Paid', date: '2025-10-14' },
      { operator: 'Bob', code: 'TX-20251015', itemName: 'Product B', quantity: 2, unitPrice: 80, discount: 0, addition: 0, totalAmount: 160, paymentMethod: 'Card', status: 'Paid', date: '2025-10-15' },
    ];

    // Converter datas do array para Date
    const normalized = salesData.map(d => ({
      ...d,
      lastUpdate: new Date(d.date)
    }));

    let start: Date | undefined = startDate ? new Date(startDate) : undefined;
    let end: Date | undefined = endDate ? new Date(endDate) : undefined;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
    if (start && !end) end = new Date(start.getTime()); // se só enviar start, end = start
    if (start && end && end < start) end = new Date(start.getTime()); // garantir intervalo válido

    // Filtrar pelo intervalo
    const result = (start && end)
      ? normalized.filter(d => {
          const t = d.lastUpdate.getTime();
          return t >= start!.getTime() && t <= end!.getTime();
        })
      : normalized;

    return of(result).pipe(
      delay(500), // simula carregamento
      catchError(err => {
        console.error('Error loading dashboard sales transactions:', err);
        throw err;
      })
    );
  }

  // DASHBOARD SALES & CASH REGISTER
  setTotalAmount(startDate?: Date, endDate?: Date): Observable<ITotalValueDto> {
    const normalized = this.datasetSaleAmount.map(d => ({
      ...d,
      lastUpdate: d.lastUpdate instanceof Date ? d.lastUpdate : new Date(d.lastUpdate!)
    }));

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start && !end) {
      end = new Date(start)
      end.setHours(23, 59, 59, 999);
    }

    const result = (start && end)
      ? normalized.filter(d => {
        const t = d.lastUpdate.getTime();
        return t >= start!.getTime() && t <= end!.getTime();
      })
      : normalized;

    const totals = result.reduce((acc, d) => {
      const amt = Number(d.totalValue || 0);
      acc.amount += amt;
      const pct = Number(d.percentage || 0);
      acc.percentageSum += pct;
      return acc;
    }, { amount: 0, percentageSum: 0, weightedPctSum: 0 });

    const response: ITotalValueDto = {
      totalValue: totals.amount,
      percentage: totals.percentageSum,
      lastUpdate: new Date(),
      startDate,
      endDate
    };

    return of(response).pipe(
      delay(500),
      catchError(err => {
        console.error('error loading mock dashboard-sales: Gross billing.\nMore details: ', err)
        throw err;
      })
    )
  }

  // DASHBOARD CASH REGISTER
  setDRstatus(searchDate?: Date): Observable<IDashboardRegisterStatusDto> {
    /*
    const dataset: IDashboardRegisterStatus[] = [
      { status: 0, operator: 'ramadan', opening: { date: '25/09/2025', time: '07:28:43' }, closing: { date: '25/09/2025', time: '18:41:09' } },
      { status: 0, operator: 'ramadan', opening: { date: '26/09/2025', time: '07:33:11' }, closing: { date: '26/09/2025', time: '18:36:55' } },
      { status: 0, operator: 'ramadan', opening: { date: '27/09/2025', time: '07:31:19' }, closing: { date: '27/09/2025', time: '18:32:48' } },
      { status: 0, operator: 'ramadan', opening: { date: '28/09/2025', time: '07:29:02' }, closing: { date: '28/09/2025', time: '18:34:27' } },
      { status: 0, operator: 'ramadan', opening: { date: '29/09/2025', time: '07:27:54' }, closing: { date: '29/09/2025', time: '18:42:18' } },
      { status: 0, operator: 'ramadan', opening: { date: '30/09/2025', time: '07:30:44' }, closing: { date: '30/09/2025', time: '18:37:59' } },
      { status: 0, operator: 'ramadan', opening: { date: '01/10/2025', time: '07:31:55' }, closing: { date: '01/10/2025', time: '18:38:22' } },
      { status: 0, operator: 'ramadan', opening: { date: '02/10/2025', time: '07:29:48' }, closing: { date: '02/10/2025', time: '18:36:40' } },
      { status: 0, operator: 'ramadan', opening: { date: '03/10/2025', time: '07:32:06' }, closing: { date: '03/10/2025', time: '18:35:12' } },
      { status: 0, operator: 'ramadan', opening: { date: '04/10/2025', time: '07:28:59' }, closing: { date: '04/10/2025', time: '18:39:47' } },
      { status: 0, operator: 'ramadan', opening: { date: '05/10/2025', time: '07:30:23' }, closing: { date: '05/10/2025', time: '18:37:01' } },
      { status: 0, operator: 'ramadan', opening: { date: '06/10/2025', time: '07:29:31' }, closing: { date: '06/10/2025', time: '18:33:29' } },
      { status: 0, operator: 'ramadan', opening: { date: '07/10/2025', time: '07:32:42' }, closing: { date: '07/10/2025', time: '18:36:14' } },
      { status: 0, operator: 'ramadan', opening: { date: '08/10/2025', time: '07:33:05' }, closing: { date: '08/10/2025', time: '18:39:58' } },
      { status: 0, operator: 'ramadan', opening: { date: '09/10/2025', time: '07:29:26' }, closing: { date: '09/10/2025', time: '18:35:03' } },
      { status: 0, operator: 'ramadan', opening: { date: '10/10/2025', time: '07:31:10' }, closing: { date: '10/10/2025', time: '18:37:46' } },
      { status: 0, operator: 'ramadan', opening: { date: '11/10/2025', time: '07:30:55' }, closing: { date: '11/10/2025', time: '18:34:09' } },
      { status: 0, operator: 'ramadan', opening: { date: '12/10/2025', time: '07:28:37' }, closing: { date: '12/10/2025', time: '18:38:22' } },
      { status: 0, operator: 'ramadan', opening: { date: '13/10/2025', time: '07:31:48' }, closing: { date: '13/10/2025', time: '18:36:15' } },
      { status: 0, operator: 'ramadan', opening: { date: '14/10/2025', time: '07:29:51' }, closing: { date: '14/10/2025', time: '18:33:44' } },
      { status: 1, operator: 'ramadan', opening: { date: '15/10/2025', time: '07:30:12' }, closing: { date: '15/10/2025', time: '—' } }
    ];
    */

    const dataset: IDashboardRegisterStatusDto = {
      status: 1,
      operator: 'ramadan',
      opening: { date: '15/10/2025', time: '07:30:12' }, closing: { date: '15/10/2025', time: '—' }
    }


    /* Normalize dataset to add searchDate for easy filtering
    const normalized = dataset.map(d => ({
      ...d,
      searchDate: new Date(
        d.opening.date.split('/').reverse().join('-') // convert DD/MM/YYYY → YYYY-MM-DD
      )
    }));

    // Filter if a searchDate is provided
    const result = searchDate
      ? normalized.filter(d =>
          d.searchDate?.toDateString() === searchDate.toDateString()
        )
      : normalized;
      */

    return of(dataset).pipe(
      delay(500),
      catchError(err => {
        console.error('Error loading dashboard register status:', err);
        throw err;
      })
    );
  }

  setDRTransactions(startDate?: Date, endDate?: Date): Observable<ICashRegisterDto[]> {
    const registerData: ICashRegisterDto[] = [
      {
        description: "Opening Float",
        totalAmount: 500.0,
        paymentMethod: "Cash",
        cashier: "John",
        status: "OPEN",
        dateTime: "2025-10-17T08:00:00",
      },
      {
        description: "Sale",
        totalAmount: 150.0,
        paymentMethod: "Card",
        cashier: "Mary",
        status: "COMPLETED",
        dateTime: "2025-10-17T09:10:00",
      },
      {
        description: "Sale",
        totalAmount: 80.0,
        paymentMethod: "Cash",
        cashier: "Mary",
        status: "COMPLETED",
        dateTime: "2025-10-17T10:20:00",
      },
      {
        description: "Withdrawal",
        totalAmount: 50.0,
        paymentMethod: "Cash",
        cashier: "John",
        status: "APPROVED",
        dateTime: "2025-10-17T13:00:00",
      },
      {
        description: "Closing",
        totalAmount: 680.0,
        paymentMethod: "Mixed",
        cashier: "John",
        status: "CLOSED",
        dateTime: "2025-10-17T18:00:00",
      },
      {
        description: "Opening Float",
        totalAmount: 400.0,
        paymentMethod: "Cash",
        cashier: "John",
        status: "OPEN",
        dateTime: "2025-10-18T08:05:00",
      },
      {
        description: "Sale",
        totalAmount: 120.0,
        paymentMethod: "Card",
        cashier: "Maria",
        status: "COMPLETED",
        dateTime: "2025-10-18T09:30:00",
      },
      {
        description: "Sale",
        totalAmount: 60.0,
        paymentMethod: "PIX",
        cashier: "Maria",
        status: "COMPLETED",
        dateTime: "2025-10-18T10:15:00",
      },
      {
        description: "Cash Reinforcement",
        totalAmount: 100.0,
        paymentMethod: "Cash",
        cashier: "John",
        status: "APPROVED",
        dateTime: "2025-10-18T12:45:00",
      },
      {
        description: "Sale",
        totalAmount: 210.0,
        paymentMethod: "Card",
        cashier: "Maria",
        status: "COMPLETED",
        dateTime: "2025-10-18T15:40:00",
      },
      {
        description: "Closing",
        totalAmount: 890.0,
        paymentMethod: "Mixed",
        cashier: "John",
        status: "CLOSED",
        dateTime: "2025-10-18T18:10:00",
      },
    ];

    // Converter datas do array para Date
    const normalized = registerData.map(d => ({
      ...d,
      lastUpdate: new Date(d.dateTime)
    }));

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start && !end) {
      end = new Date(start)
      end.setHours(23, 59, 59, 999);
    }

    // Filtrar pelo intervalo
    const result = (start && end)
      ? normalized.filter(d => {
          const t = d.lastUpdate.getTime();
          return t >= start!.getTime() && t <= end!.getTime();
        })
      : normalized;

    return of(result).pipe(
      delay(500), // simula carregamento
      catchError(err => {
        console.error('Error loading dashboard cash register transactions:', err);
        throw err;
      })
    );
  }
}
