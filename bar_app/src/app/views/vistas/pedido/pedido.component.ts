import { Component, OnInit, signal } from '@angular/core';
import { Pedido } from 'src/app/interfaces/pedido';
import { PedidoService } from 'src/app/services/pedido.service';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  pedidos: Pedido[] = [];


  cargando = signal(false);
  mensajeFeedback = signal<{ texto: string, tipo: 'success' | 'error' } | null>(null);

  constructor(private pedidoService: PedidoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' = 'success') {
    this.mensajeFeedback.set({ texto, tipo });
    setTimeout(() => this.mensajeFeedback.set(null), 4000);
  }

  calcularTotal(pedido: any): number {
    if (!pedido.lineas) return 0;
    return pedido.lineas.reduce((total: number, linea: any) => {
      const precio = linea.producto?.precio ?? 0;
      return total + (linea.cantidad * precio);
    }, 0);
  }


  cargarPedidos() {
    this.cargando.set(true);
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data.filter(p => !p.pagado);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarMensaje('Error al conectar con el servidor', 'error');
      }
    });
  }

  marcarPagado(id: number): void {
    const pedido = this.pedidos.find(p => p.id === id);
    if (!pedido) return;

    const total = this.calcularTotal(pedido);
    
    // Generación del ticket PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`TICKET DE CONSUMO - ${pedido.ubicacion}`, 10, 20);
    doc.setFontSize(12);
    let y = 35;

    pedido.lineas?.filter(l => l.producto).forEach((linea: any) => { 
      const precioTotalLinea = (linea.cantidad * (linea.producto?.precio ?? 0)); 
      doc.text(`${linea.cantidad}x ${linea.producto.nombre}`, 10, y);
      doc.text(`${precioTotalLinea.toFixed(2)}€`, 160, y);
      
      if (linea.modificacion) {
        y += 6;
        doc.setFontSize(10);
        doc.text(`  Nota: ${linea.modificacion}`, 12, y);
        doc.setFontSize(12);
      }
      y += 10;
    });
    
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL A PAGAR: ${total.toFixed(2)}€`, 10, y);
    
    doc.save(`ticket_${pedido.ubicacion}_${Date.now()}.pdf`);

    // Actualizamos el estado a 'listo para cobrar' o directamente a pagado según tu lógica
    this.pedidoService.actualizarEstado(id, 'listo para cobrar').subscribe({
      next: () => {
        this.mostrarMensaje(`Ticket generado para ${pedido.ubicacion}.`);
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.mostrarMensaje('No se pudo actualizar el estado del pedido', 'error');
      }
    });
  }

  modificarPedido(id: number) {
    this.router.navigate(['/barra/pedidos/modificar', id]);
  }

  eliminarPedido(id: number) {
    // Protección: No permitir borrar pedidos del usuario actual si tuvieras esa lógica aquí
    this.pedidoService.delete(id).subscribe({
      next: () => {
        this.mostrarMensaje('Comanda eliminada correctamente.');
        this.pedidos = this.pedidos.filter(p => p.id !== id);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        if (err.status === 403) {
          this.mostrarMensaje('No se puede eliminar un pedido activo', 'error');
        } else {
          this.mostrarMensaje('Error al eliminar el pedido', 'error');
        }
      }
    });
  }
}