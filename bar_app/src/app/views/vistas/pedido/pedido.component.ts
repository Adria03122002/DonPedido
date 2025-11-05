import { Component, OnInit } from '@angular/core';
import { Pedido } from 'src/app/interfaces/pedido';
import { PedidoService } from 'src/app/services/pedido.service';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  pedidos: Pedido[] = [];

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }


  calcularTotal(pedido: any): number {
      return pedido.lineas.reduce((total: number, linea: any) => {
          const precio = linea.producto?.precio ?? 0; 
          
          return total + (linea.cantidad * precio);
      }, 0);
  }


  cargarPedidos() {
    this.pedidoService.getPedidos().subscribe(pedidos => {
      this.pedidos = pedidos.filter(p => !p.pagado); 
    });
  }

  marcarPagado(id: number): void {
    const pedido = this.pedidos.find(p => p.id === id);
    if (!pedido) return;

    const total = this.calcularTotal(pedido);
    const metodoPago = prompt('Método de pago (efectivo, tarjeta, etc.):');

    if (!metodoPago || metodoPago.trim() === '') {
      alert('Debes especificar un método de pago.');
      return;
    }

    const doc = new jsPDF();
    doc.text(`Factura - Pedido Mesa ${pedido.ubicacion?.numero || pedido.ubicacion?.tipo}`, 10, 10);
    let y = 20;

    pedido.lineas?.forEach((linea: any) => {
      doc.text(`${linea.cantidad}x ${linea.producto.nombre} - ${linea.cantidad * linea.producto.precio}€`, 10, y);
      if (linea.modificacion) {
        y += 6;
        doc.text(`  Modificación: ${linea.modificacion}`, 10, y);
      }
      y += 10;
    });

    doc.text(`Total: ${total}€`, 10, y);
    y += 10;
    doc.text(`Método de pago: ${metodoPago}`, 10, y);
    doc.save(`pedido_mesa_${pedido.ubicacion?.numero || pedido.ubicacion?.tipo}.pdf`);

    // Llamada al backend
    this.pedidoService.marcarComoPagado(id, metodoPago).subscribe(() => {
      // Eliminar el pedido de la lista o actualizar
      this.pedidos = this.pedidos.filter(p => p.id !== id);
    });
  }

}
