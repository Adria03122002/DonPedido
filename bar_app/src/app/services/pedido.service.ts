import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CrearPedidoPayload, Pedido } from '../interfaces/pedido';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  
  // URL base según tu esquema: bar_app
  private readonly API_URL = 'http://localhost:3000/bar_app/pedidos';

  /**
   * --- CONSULTAS (GET) ---
   */

  // GET /bar_app/pedidos -> PedidoController -> all
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  // GET /bar_app/pedidos/:id -> PedidoController -> one
  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // GET /bar_app/pedidos/activos -> PedidoController -> getPedidosActivos
  getPedidosActivos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API_URL}/activos`).pipe(
      catchError(this.handleError)
    );
  }

  // GET /bar_app/pedidos/mesa/:ubicacionString/activo -> PedidoController -> getPedidoActivoPorMesa
  getPedidoActivoPorMesa(ubicacion: string | number): Observable<any> {
    return this.http.get(`${this.API_URL}/mesa/${ubicacion}/activo`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * --- OPERACIONES DE CREACIÓN Y ACTUALIZACIÓN (POST / PUT) ---
   */

  // POST /bar_app/pedidos -> PedidoController -> save
  crearPedido(pedidoPayload: CrearPedidoPayload): Observable<Pedido> {
    return this.http.post<Pedido>(this.API_URL, pedidoPayload).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /bar_app/pedidos/:id -> PedidoController -> updatePedido
  // (Usado para añadir líneas o modificaciones generales)
  updatePedido(id: number, pedidoPayload: any): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.API_URL}/${id}`, pedidoPayload).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /bar_app/pedidos/:id/estado -> PedidoController -> updatePedido
  // (Específico para cambios de estado: pendiente, cocinando, servido)
  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/estado`, { estado }).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /bar_app/pedidos/:id/pagar -> PedidoController -> marcarComoPagado
  marcarComoPagado(id: number, formaPago: string): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/pagar`, { formaPago }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * --- ELIMINACIÓN ---
   */

  // DELETE /bar_app/pedidos/:id -> PedidoController -> delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * MANEJO DE ERRORES
   */
  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      // Devolvemos el error para que el componente lo maneje (ej: mesa libre)
      return throwError(() => error);
    }
    console.error(`Error ${error.status}:`, error.error);
    return throwError(() => new Error(error.error?.message || 'Error en el servidor'));
  }
}