import { Component, OnInit, inject, signal, computed, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Interfaz para definir el estado de cada mesa en el mapa
 */
interface MesaEstado {
  numero: number;
  ocupada: boolean;
  pedidoId: number | null;
  estado: string;
  total: number;
}

@Component({
  selector: 'app-camarero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camarero.component.html',
  styleUrls: ['./camarero.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CamareroComponent implements OnInit, OnDestroy {
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  mesas = signal<MesaEstado[]>([]);
  private intervalId: any;
  
  mesasLibres = computed(() => this.mesas().filter(m => !m.ocupada).length);
  totalPendiente = computed(() => this.mesas().reduce((acc, m) => acc + m.total, 0));

  ngOnInit() {
    this.refrescarMapa();
    this.intervalId = setInterval(() => this.refrescarMapa(), 20000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  refrescarMapa() {
    this.pedidoService.getMapaMesas().subscribe({
      next: (res) => {
        this.mesas.set(res);
      },
      error: (err) => {
        console.error("Error al sincronizar el mapa de mesas:", err);
      }
    });
  }

  gestionarMesa(mesa: MesaEstado) {
    if (mesa.ocupada && mesa.pedidoId) {
      this.router.navigate(['/barra/pedidos/modificar', mesa.pedidoId]);
    } else {
      this.router.navigate(['/barra/crear'], { queryParams: { mesa: `Mesa ${mesa.numero}` } });
    }
  }

  irARecoger() {
    this.router.navigate(['/barra/crear'], { queryParams: { tipo: 'recoger' } });
  }

  logout() {
    this.authService.logout();
  }

  getClaseEstado(mesa: MesaEstado): string {
    if (!mesa.ocupada) return 'mesa-libre';
    
    switch (mesa.estado) {
      case 'pendiente':
      case 'en preparación':
        return 'mesa-pendiente'; 
      case 'servido':
        return 'mesa-servida';   
      default:
        return '';
    }
  }
}