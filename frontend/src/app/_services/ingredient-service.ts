import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IngredientsListDTO } from '../_interfaces/ingredients-list-dto';
import { IngredientsCreateDTO } from '../_interfaces/ingredients-create-dto';
import { IngredientsUpdateDTO } from '../_interfaces/ingredients-update-dto';
import { ResponseDTO } from '../_interfaces/response-dto';
import { IngredientsCardsDTO } from '../_interfaces/ingredients-cards-dto';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  private readonly api = `${environment.myUrl}/api/Ingredients`;
  private readonly http = inject(HttpClient);

  getAll = () : Observable<IngredientsListDTO> => this.http.get<IngredientsListDTO>(`${this.api}/v1/get-all`);

  create = (data: IngredientsCreateDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create`, data);

  update = (data: IngredientsUpdateDTO) : Observable<ResponseDTO> => this.http.patch<ResponseDTO>(`${this.api}/v1/update`, data);

  delete = (id: string) : Observable<ResponseDTO> => this.http.delete<ResponseDTO>(`${this.api}/v1/delete/${id}`);

  getCards = () : Observable<IngredientsCardsDTO> => this.http.get<IngredientsCardsDTO>(`${this.api}/v1/get-cards`);
}
