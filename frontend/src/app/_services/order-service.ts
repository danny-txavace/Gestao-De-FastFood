import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../_interfaces/response-dto';
import { OrdersCreateDTO } from '../_interfaces/orders-create-dto';
import { OrdersListDTO } from '../_interfaces/orders-list-dto';
import { OrdersCreatePayNowDTO } from '../_interfaces/orders-create-pay-now-dto';
import { OrdersUpdatePayNowDTO } from '../_interfaces/orders-update-pay-now-dto';
import { OrdersCheckPosDTO } from '../_interfaces/orders-check-pos-dto';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly api = `${environment.myUrl}/api/Orders`;
  private readonly http = inject(HttpClient);

  checkPos = (userId: string) : Observable<OrdersCheckPosDTO> => this.http.get<OrdersCheckPosDTO>(`${this.api}/v1/check-pos/${userId}`);

  getAllById = (registerId: string) : Observable<OrdersListDTO> => this.http.get<OrdersListDTO>(`${this.api}/v1/get-all/${registerId}`);

  getAll = () : Observable<OrdersListDTO> => this.http.get<OrdersListDTO>(`${this.api}/v1/get-all`);

  create = (data: OrdersCreateDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create`, data);

  createPayNow = (data: OrdersCreatePayNowDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create-pay-now`, data);

  getReceiptNumber = () : Observable<{ receiptNumber: string }> => this.http.get<{ receiptNumber: string }>(`${this.api}/v1/get-receipt-number`);

  updatePayNow = (data: OrdersUpdatePayNowDTO) : Observable<ResponseDTO> => this.http.put<ResponseDTO>(`${this.api}/v1/update`, data);
}
