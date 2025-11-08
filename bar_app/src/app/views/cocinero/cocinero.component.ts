import { Component } from '@angular/core';
import { PedidoService } from 'src/app/services/pedido.service';
import { Pedido } from 'src/app/interfaces/pedido';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cocinero',
  templateUrl: './cocinero.component.html',
  styleUrls: ['./cocinero.component.css']
})
export class CocineroComponent {

  pedidos: Pedido[] = [];

  constructor(private pedidoService: PedidoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

    cargarPedidos() {
        this.pedidoService.getPedidosActivosAgrupados().subscribe({
            next: (data) => {
                this.pedidos = data;
            },
            error: (err) => {
                console.error('Error al cargar pedidos agrupados', err);
            }
        });
    }


  calcularTiempoTranscurrido(fecha: string): string {
  const ahora = new Date();
  const creada = new Date(fecha);
  const diffMs = ahora.getTime() - creada.getTime();

  const minutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutos / 60);

  if (horas > 0) {
    return `${horas}h ${minutos % 60}min`;
  } else {
    return `${minutos} min`;
  }
}


  salir() {
    this.router.navigate(['/']);  
  }

marcarComoTerminado(id: number) {
  const confirmado = window.confirm("¿Estás seguro de que quieres marcar este pedido como terminado?");
  if (confirmado) {
    this.pedidoService.actualizarEstado(id, 'servido').subscribe(() => {
      this.cargarPedidos(); // o lo que uses para refrescar
    });
  }
}

}
