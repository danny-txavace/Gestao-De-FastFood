import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDTO } from '../_interfaces/response-dto';
import { CustomerCreateDTO } from '../_interfaces/customer-create-dto';
import { CustomerListDTO } from '../_interfaces/customer-list-dto';
import { CustomerUpdateDTO } from '../_interfaces/customer-update-dto';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly api = `${environment.myUrl}/api/Customers`;
  private readonly http = inject(HttpClient);

  getAll = () : Observable<CustomerListDTO> => this.http.get<CustomerListDTO>(`${this.api}/v1/get-all`);

  create = (data: CustomerCreateDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create`, data);

  delete = (id: string) : Observable<ResponseDTO> => this.http.delete<ResponseDTO>(`${this.api}/v1/delete/${id}`);

  update = (data: CustomerUpdateDTO) : Observable<ResponseDTO> => this.http.patch<ResponseDTO>(`${this.api}/v1/update`, data);
}
