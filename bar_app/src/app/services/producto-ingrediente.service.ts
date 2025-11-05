import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductoIngrediente } from '../interfaces/producto-ingrediente';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoIngredienteService {
  private apiUrl = 'http://localhost:3000/bar_app/producto-ingredientes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductoIngrediente[]> {
    return this.http.get<ProductoIngrediente[]>(this.apiUrl);
  }

  getOne(id: number): Observable<ProductoIngrediente> {
    return this.http.get<ProductoIngrediente>(`${this.apiUrl}/${id}`);
  }

  create(productoIngrediente: ProductoIngrediente): Observable<ProductoIngrediente> {
    return this.http.post<ProductoIngrediente>(this.apiUrl, productoIngrediente);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
