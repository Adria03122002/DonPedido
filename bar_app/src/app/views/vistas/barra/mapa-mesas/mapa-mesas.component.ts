import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';

@Component({
  selector: 'app-mapa-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-mesas.component.html',
  styleUrls: ['./mapa-mesas.component.css']
})
export class MapaMesasComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  pedidosSinPagar = signal<any[]>([]);
  ubicacionSeleccionada = signal<string | null>(null);
  nombreCliente: string = '';

  mesasOcupadas = computed(() => {
    return this.pedidosSinPagar()
      .filter(p => p.ubicacion && p.ubicacion.startsWith('Mesa '))
      .map(p => p.ubicacion.trim());
  });

  ngOnInit() {
    this.pedidoService.getPedidos().subscribe(res => {
      this.pedidosSinPagar.set(res.filter(p => !p.pagado));
    });
  }

  isOcupada(numero: number): boolean {
    return this.mesasOcupadas().includes(`Mesa ${numero}`);
  }

  seleccionarUbicacion(nombre: string) {
    if (nombre.startsWith('Mesa') && this.isOcupada(parseInt(nombre.split(' ')[1]))) return;
    this.ubicacionSeleccionada.set(nombre);
  }

  continuarALaCarta() {
    if (!this.ubicacionSeleccionada()) return;
    this.router.navigate(['/barra/crear'], { 
      queryParams: { 
        mesa: this.ubicacionSeleccionada(),
        cliente: this.nombreCliente 
      } 
    });
  }
}