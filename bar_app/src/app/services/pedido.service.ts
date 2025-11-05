import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrearPedidoPayload, Pedido } from '../interfaces/pedido';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrl = 'http://localhost:3000/bar_app/pedidos';

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  getPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  crearPedido(pedidoPayload: CrearPedidoPayload): Observable<Pedido> { 
   return this.http.post<Pedido>(this.apiUrl, pedidoPayload);
  }
    
    // Nuevo método necesario para el camarero
  updatePedido(id: number, pedidoPayload: CrearPedidoPayload): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedidoPayload);
  }

  eliminarPedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

   getPedidosActivosAgrupados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activos/agrupados`);
   }

  cerrarCaja(): Observable<any> {
    return this.http.delete('http://localhost:3000/bar_app/cerrar-caja');
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
  }

  marcarComoPagado(id: number, formaPago: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/pagar`, { formaPago });
  }

  getPedidoActivoPorMesa(mesaId: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/mesa/${mesaId}/activo`);
  }
}
