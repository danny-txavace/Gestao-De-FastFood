import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsListDTO } from '../_interfaces/products-list-dto';
import { ResponseDTO } from '../_interfaces/response-dto';
import { ProductIngredientsUpdateDTO } from '../_interfaces/product-ingredients-update-dto';
import { ProductIngredientsListDTO } from '../_interfaces/product-ingredients-list-dto';
import { ProductIngredientsCreateDTO } from '../_interfaces/product-ingredients-create-dto';
import { ProductIngredientSelectIngredientDTO } from '../_interfaces/product-ingredient-select-ingredient-dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = `${environment.myUrl}/api/Products`;
  private readonly http = inject(HttpClient);

  getAll = () : Observable<ProductsListDTO> => this.http.get<ProductsListDTO>(`${this.api}/v1/get-all`);

  create = (data: FormData) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create`, data);

  update = (data: FormData) : Observable<ResponseDTO> => this.http.patch<ResponseDTO>(`${this.api}/v1/update`, data);

  delete = (id: string) : Observable<ResponseDTO> => this.http.delete<ResponseDTO>(`${this.api}/v1/delete/${id}`);

  // product-ingredient
  getProductIngredient = (productId: string) : Observable<ProductIngredientsListDTO> => this.http.get<ProductIngredientsListDTO>(`${this.api}/v1/get-product-ingredient/${productId}`);

  createProductIngredient = (data: ProductIngredientsCreateDTO) : Observable<ResponseDTO> => this.http.post<ResponseDTO>(`${this.api}/v1/create-product-ingredient`, data);

  updateProductIngredient = (data: ProductIngredientsUpdateDTO) : Observable<ResponseDTO> => this.http.patch<ResponseDTO>(`${this.api}/v1/update-product-ingredient`, data);

  deleteProductIngredient = (id: string) : Observable<ResponseDTO> => this.http.delete<ResponseDTO>(`${this.api}/v1/delete-product-ingredient/${id}`);

  getSelectIgredient = () : Observable<ProductIngredientSelectIngredientDTO> => this.http.get<ProductIngredientSelectIngredientDTO>(`${this.api}/v1/get-select-ingredient`);

  // pos new order
  getProductContent(): Observable<ProductsListDTO[]> {
    return this.http.get<ProductsListDTO[]>(`${this.api}/v1/get-all`);
  }
}
