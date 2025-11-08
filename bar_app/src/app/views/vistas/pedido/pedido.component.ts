import { Component, OnInit } from '@angular/core';
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

  constructor(private pedidoService: PedidoService, private router: Router) {}

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
          this.pedidoService.getPedidosActivosAgrupados().subscribe({
              next: (data) => {
                  this.pedidos = data; 
              },
              error: (err) => {
                console.error('Error al cargar pedidos agrupados:', err);
                this.pedidoService.getPedidos().subscribe(pedidos => this.pedidos = pedidos.filter(p => !p.pagado));
              }
          });
  }

    marcarPagado(id: number): void {
        const pedido = this.pedidos.find(p => p.id === id);

        if (!pedido) return;

        const total = this.calcularTotal(pedido);
        
        
        const doc = new jsPDF();
        doc.text(`Factura - Pedido Mesa ${pedido.ubicacion?.numero || pedido.ubicacion?.tipo}`, 10, 10);
        let y = 20;

        pedido.lineas?.filter(l => l.producto).forEach((linea: any) => { 
            const precioTotalLinea = (linea.cantidad * (linea.producto?.precio ?? 0)); 
            
            doc.text(`${linea.cantidad}x ${linea.producto.nombre} - ${precioTotalLinea}€`, 10, y);
            
            if (linea.modificacion) {
                y += 6;
                doc.text(`  Modificación: ${linea.modificacion}`, 10, y);
            }
            y += 10;
        });
        
        doc.text(`Total: ${total}€`, 10, y);
        y += 10;
        doc.text(`Método de pago: Generado`, 10, y); 
        doc.save(`ticket_mesa_${pedido.ubicacion?.numero || pedido.ubicacion?.tipo}_${Date.now()}.pdf`);

        const formaPagoFicticia = 'GENERADO'; 
        
        this.pedidoService.marcarComoPagado(id, formaPagoFicticia).subscribe({
            next: () => {
                alert(`Ticket generado. Pedido listo para eliminar.`);
                this.cargarPedidos();
            },
            error: (err) => {
                console.error('Error al comunicar el pago:', err);
                alert('Error al comunicar el pago al servidor. Verifique la conexión.');
            }
        });
    }

    eliminarPedido(id: number) {
        if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
            this.pedidoService.delete(id).subscribe({
                next: () => {
                    alert('Comanda eliminada correctamente.');
                    this.pedidos = this.pedidos.filter(p => p.id !== id);
                },
                error: (err) => {
                    console.error('Error al eliminar el pedido:', err);
                    
                    if (err.status === 403) {
                        alert('ERROR: No se puede eliminar un pedido activo. Solo se pueden eliminar los pedidos que ya han sido marcados como pagados (ticket generado).');
                    } else {
                        alert('Error al eliminar el pedido. Revisa la consola para más detalles.');
                    }
                }
            });
        }
    }

}
