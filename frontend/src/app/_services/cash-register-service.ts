import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CashRegisterListDTO } from '../_interfaces/cash-register-list-dto';
import { HttpClient } from '@angular/common/http';
import { CashRegisterOpenDTO } from '../_interfaces/cash-register-open-dto';
import { CashRegisterCloseDTO } from '../_interfaces/cash-register-close-dto';
import { ResponseDTO } from '../_interfaces/response-dto';
import { CashRegisterSelectUserDTO } from '../_interfaces/cash-register-select-user-dto';
import { CashRegisterDetailCreateDTO } from '../_interfaces/cash-register-detail-create-dto';
import { CashRegisterDetailListDTO } from '../_interfaces/cash-register-detail-list-dto';
import { CashRegisterDetailUpdateDTO } from '../_interfaces/cash-register-detail-update-dto';
import { CashRegisterCardsDTO } from '../_interfaces/cash-register-cards-dto';

@Injectable({
  providedIn: 'root',
})
export class CashRegisterService {
  private readonly api = `${environment.myUrl}/api/CashRegister`;
  private readonly http = inject(HttpClient);

  getAll = () : Observable<CashRegisterListDTO> => this.http.get<CashRegisterListDTO>(`${this.api}/v1/get-all`);

  openRegister = (data: CashRegisterOpenDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/open-register`, data);

  closeRegister = (data: CashRegisterCloseDTO) : Observable<ResponseDTO> => this.http.put<ResponseDTO>(`${this.api}/v1/close-register`, data);

  delete = (id: string) : Observable<ResponseDTO> => this.http.delete<ResponseDTO>(`${this.api}/v1/delete/${id}`);

  getSelectUserToOpenCash = () : Observable<CashRegisterSelectUserDTO> => this.http.get<CashRegisterSelectUserDTO>(`${this.api}/v1/get-select-user-to-open-cash`);

  getSelectUserToCloseCash = () : Observable<CashRegisterSelectUserDTO> => this.http.get<CashRegisterSelectUserDTO>(`${this.api}/v1/get-select-user-to-close-cash`);

  getAllDetails = (cashRegisterId: string) : Observable<CashRegisterDetailListDTO> => this.http.get<CashRegisterDetailListDTO>(`${this.api}/v1/get-cash-details/${cashRegisterId}`);

  createCashDetails = (data: CashRegisterDetailCreateDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create-cash-details`, data);

  updateCashDetails = (data: CashRegisterDetailUpdateDTO) : Observable<ResponseDTO> => this.http.put<ResponseDTO>(`${this.api}/v1/update-cash_details`, data);

  getCards = () : Observable<CashRegisterCardsDTO> => this.http.get<CashRegisterCardsDTO>(`${this.api}/v1/get-cards`);

  getCardsById = (id: string) : Observable<CashRegisterCardsDTO> => this.http.get<CashRegisterCardsDTO>(`${this.api}/v1/get-cards/${id}`);
}
