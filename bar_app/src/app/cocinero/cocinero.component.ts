import { Component, OnInit, inject, signal, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoService } from '../services/pedido.service';
import { Pedido } from '../interfaces/pedido';

@Component({
  selector: 'app-cocinero',
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css']
})
export class CocineroComponent implements OnInit {

  private pedidoService = inject(PedidoService);
  pedidos = signal<Pedido[]>([]);

  ngOnInit(): void {
    this.cargarPedidos();
    // Auto-recarga cada 30 segundos
    setInterval(() => this.cargarPedidos(), 30000);
  }

  cargarPedidos(): void {
    this.pedidoService.getPedidosActivos().subscribe({
      next: (data) => this.pedidos.set(data),
      error: (err) => console.error('Error al cargar pedidos', err)
    });
  }

  marcarComoTerminado(id: any): void {
    const idNum = Number(id);
    this.pedidoService.actualizarEstado(idNum, 'servido').subscribe({
      next: () => {
        this.pedidos.update(actuales => actuales.filter(p => Number(p.id) !== idNum));
      },
      error: (err) => console.error('Error al terminar', err)
    });
  }

  calcularTiempoTranscurrido(fecha: string): string {
    if (!fecha) return '...';
    const ahora = new Date();
    const entrada = new Date(fecha);
    const difMs = ahora.getTime() - entrada.getTime();
    const difMin = Math.floor(difMs / 60000);

    if (difMin < 1) return 'ahora mismo';
    if (difMin < 60) return `${difMin} min`;
    const horas = Math.floor(difMin / 60);
    return `${horas} h ${difMin % 60} min`;
  }

  salir(): void {
    console.log('Saliendo de la aplicación...');
  }
}