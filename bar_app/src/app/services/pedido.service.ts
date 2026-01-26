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
  
  // Tu URL base corregida
  private readonly API_URL = 'http://localhost:3000/bar_app/pedidos';

  /**
   * CONFIGURACIÓN DE REINTENTOS
   * Si el servidor da un error 500, Angular reintentará la petición 
   * automáticamente 3 veces antes de mostrar el error final.
   */
  private readonly retryConfig = {
    count: 3,
    delay: (error: HttpErrorResponse, retryCount: number) => {
      // Solo reintenta si es un error de servidor (500) o de red (0)
      if (error.status >= 500 || error.status === 0) {
        return timer(retryCount * 1000); // Espera 1s, luego 2s, luego 3s...
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

  // Este es el método que suele usar la vista de cocina
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

  /**
   * MANEJO DE ERRORES MEJORADO
   */
  private handleError(error: HttpErrorResponse) {
    // Si el backend no encuentra el recurso (404), lanzamos el error original
    if (error.status === 404) {
      return throwError(() => error);
    }

    // Si es un error 500, intentamos dar un mensaje más descriptivo
    const mensaje = error.error?.message || 'Error crítico en el servidor (500)';
    console.error(`Error Detectado [Status ${error.status}]:`, error.error);
    
    return throwError(() => new Error(mensaje));
  }
}