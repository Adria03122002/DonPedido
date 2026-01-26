import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
import { AuthService } from 'src/app/services/auth.service';
import { Pedido } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-cocinero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css']
})
export class CocineroComponent implements OnInit, OnDestroy {
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  pedidos = signal<Pedido[]>([]);
  
  // Lógica de refresco automático
  segundosRestantes = signal(15);
  private timerInterval: any;

  ngOnInit(): void {
    this.cargarPedidos();
    this.iniciarTemporizador();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  iniciarTemporizador(): void {
    this.timerInterval = setInterval(() => {
      this.segundosRestantes.update(s => s - 1);
      
      if (this.segundosRestantes() <= 0) {
        this.cargarPedidos();
        this.segundosRestantes.set(15); // Reiniciar cuenta atrás
      }
    }, 1000);
  }

  cargarPedidos(): void {
    this.pedidoService.getPedidosActivos().subscribe({
      next: (res) => {
        // --- CAMBIO CLAVE: ORDENAMIENTO POR TIEMPO ---
        // Ordenamos de menor a mayor tiempo (el más antiguo primero)
        // Comparamos los milisegundos de las fechas
        const pedidosOrdenados = res.sort((a, b) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });
        
        this.pedidos.set(pedidosOrdenados);
      },
      error: (err) => console.error('Error cargando cocina:', err)
    });
  }

  /**
   * Optimización para la renderización de listas en Angular 16
   */
  trackById(index: number, item: Pedido): number {
    return item.id;
  }

  salir(): void {
    this.authService.logout();
  }

  formatearUbicacion(u: any): string {
    if (!u) return 'S/N';
    if (typeof u === 'string') return u;
    return `${u.tipo || ''} ${u.numero || ''}`.trim();
  }

  calcularTiempo(fecha: string): string {
    const ahora = new Date();
    const creada = new Date(fecha);
    const diffMs = ahora.getTime() - creada.getTime();
    const minutos = Math.floor(diffMs / 60000);
    return `${minutos}m`;
  }

  marcarComoTerminado(id: number): void {
    this.pedidoService.actualizarEstado(id, 'servido').subscribe({
      next: () => {
        // Eliminamos el pedido de la vista actual inmediatamente
        this.pedidos.update(p => p.filter(item => item.id !== id));
      },
      error: (err) => console.error('Error al actualizar estado:', err)
    });
  }
}