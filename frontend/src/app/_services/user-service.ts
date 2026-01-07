import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersListDTO } from '../_interfaces/users-list-dto';
import { UsersCreateDTO } from '../_interfaces/users-create-dto';
import { ResponseDTO } from '../_interfaces/response-dto';
import { UsersUpdateDTO } from '../_interfaces/users-update-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api = `${environment.myUrl}/api/Users`;
  private readonly http = inject(HttpClient);

  getAll = () : Observable<UsersListDTO> => this.http.get<UsersListDTO>(`${this.api}/v1/get-all`);

  createUser = (data: UsersCreateDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/defts-create`, data);

  deleteUser = (id: string) : Observable<ResponseDTO> => this.http.delete<ResponseDTO>(`${this.api}/v1/delete/${id}`);

  updateUser = (data: UsersUpdateDTO) : Observable<ResponseDTO> => this.http.patch<ResponseDTO>(`${this.api}/v1/update`, data);
}
