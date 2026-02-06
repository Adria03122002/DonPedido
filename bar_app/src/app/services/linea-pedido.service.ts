import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LineaPedido } from '../interfaces/linea-pedido';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LineaPedidoService {
  private http = inject(HttpClient);

  private getApiUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;

    if (port === '4200') {
      return `http://${hostname}:3000/bar_app/lineas-pedido`;
    }
    
    return '/bar_app/lineas-pedido';
  }

  private readonly apiUrl = this.getApiUrl();

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