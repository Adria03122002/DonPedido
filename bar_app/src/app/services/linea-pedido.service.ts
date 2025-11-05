import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LineaPedido } from '../interfaces/linea-pedido';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LineaPedidoService {
  private apiUrl = 'http://localhost:3000/bar_app/lineas-pedido';

  constructor(private http: HttpClient) {}

  getLineasPedido(): Observable<LineaPedido[]> {
    return this.http.get<LineaPedido[]>(this.apiUrl);
  }

  getLineaPedido(id: number): Observable<LineaPedido> {
    return this.http.get<LineaPedido>(`${this.apiUrl}/${id}`);
  }

  crearLineaPedido(linea: LineaPedido): Observable<LineaPedido> {
    return this.http.post<LineaPedido>(this.apiUrl, linea);
  }

  eliminarLineaPedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
