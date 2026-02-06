import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CrearPedidoPayload, Pedido } from '../interfaces/pedido';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);

  private getApiUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;

    if (port === '4200') {
      return `http://${hostname}:3000/bar_app/pedidos`;
    }
    
    return '/bar_app/pedidos';
  }

  private readonly API_URL = this.getApiUrl();

  private readonly retryConfig = {
    count: 3,
    delay: (error: HttpErrorResponse, retryCount: number) => {
      if (error.status >= 500 || error.status === 0) {
        return timer(retryCount * 1000);
      }
      return throwError(() => error);
    }
  };

  getMapaMesas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/mapa-mesas`).pipe(
      retry(this.retryConfig),
      catchError(this.handleError)
    );
  }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API_URL).pipe(
      retry(this.retryConfig),
      catchError(this.handleError)
    );
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API_URL}/${id}`).pipe(
      retry(this.retryConfig),
      catchError(this.handleError)
    );
  }

  getPedidosActivos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API_URL}/activos`).pipe(
      retry(this.retryConfig),
      catchError(this.handleError)
    );
  }

  getPedidoActivoPorMesa(ubicacion: string | number): Observable<any> {
    return this.http.get(`${this.API_URL}/mesa/${ubicacion}/activo`).pipe(
      catchError(this.handleError)
    );
  }

  crearPedido(pedidoPayload: CrearPedidoPayload): Observable<Pedido> {
    return this.http.post<Pedido>(this.API_URL, pedidoPayload).pipe(
      catchError(this.handleError)
    );
  }

  updatePedido(id: number, pedidoPayload: any): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.API_URL}/${id}`, pedidoPayload).pipe(
      catchError(this.handleError)
    );
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/estado`, { estado }).pipe(
      catchError(this.handleError)
    );
  }

  marcarComoPagado(id: number, formaPago: string): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/pagar`, { formaPago }).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError(() => error);
    }

    const mensaje = error.error?.message || 'Error crítico en el servidor (500)';
    console.error(`Error Detectado [Status ${error.status}]:`, error.error);
    
    return throwError(() => new Error(mensaje));
  }
}