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
  
  pedidos = signal<Pedido[]>([]);
  private refrescoInterval: any;

  ngOnInit(): void {
    this.cargarPedidos();
    this.iniciarRefrescoAutomatico();
  }

  ngOnDestroy(): void {
    if (this.refrescoInterval) {
      clearInterval(this.refrescoInterval);
    }
  }

  iniciarRefrescoAutomatico(): void {
    this.refrescoInterval = setInterval(() => {
      this.cargarPedidos();
    }, 5000);
  }

  cargarPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (res) => {
        const filtrados = res.filter(p => 
          !p.pagado && 
          (p.estado === 'pendiente' || p.estado === 'en preparación')
        );

        const pedidosOrdenados = filtrados.sort((a, b) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });
        
        this.pedidos.set(pedidosOrdenados);
      },
      error: (err) => console.error('Error cargando cocina:', err)
    });
  }

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
        this.pedidos.update(p => p.filter(item => item.id !== id));
      },
      error: (err) => console.error('Error al actualizar estado:', err)
    });
  }
}