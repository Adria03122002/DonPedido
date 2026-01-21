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
  cargando: boolean = false;

  constructor(private pedidoService: PedidoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  /**
   * Calcula el total de forma segura. 
   * Maneja casos donde el precio llega como string desde la base de datos.
   */
  calcularTotal(pedido: any): number {
    if (!pedido || !pedido.lineas || !Array.isArray(pedido.lineas)) return 0;
    
    return pedido.lineas.reduce((total: number, linea: any) => {
      // Forzamos la conversión a número por si el backend envía strings (decimales de MySQL)
      const precio = Number(linea.producto?.precio || 0);
      const cantidad = Number(linea.cantidad || 0);
      return total + (cantidad * precio);
    }, 0);
  }

  /**
   * Carga las comandas activas (pagado = false).
   */
  cargarPedidos() {
    this.cargando = true;
    this.pedidoService.getPedidosActivos().subscribe({
      next: (data) => {
        // Validación de seguridad: Nos aseguramos de recibir un array
        if (Array.isArray(data)) {
          this.pedidos = data;
        } else {
          console.warn('El servidor no devolvió un array de pedidos:', data);
          this.pedidos = [];
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos activos:', err);
        this.cargando = false;
        // Intento de recuperación cargando todos y filtrando manualmente
        this.pedidoService.getPedidos().subscribe(todos => {
          this.pedidos = todos.filter(p => !p.pagado);
        });
      }
    });
  }

  /**
   * Genera el ticket PDF y cambia el estado del pedido.
   */
  marcarPagado(id: number): void {
    const pedido = this.pedidos.find(p => p.id === id);
    if (!pedido) return;

    // Recalculamos el total para asegurar que el ticket sea correcto
    const totalCalculado = this.calcularTotal(pedido);
    
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`TICKET DE CONSUMO - ${pedido.ubicacion}`, 10, 20);
      doc.setFontSize(12);
      let y = 35;

      if (pedido.lineas && Array.isArray(pedido.lineas)) {
        pedido.lineas.filter(l => l.producto).forEach((linea: any) => { 
          const precioUnitario = Number(linea.producto?.precio || 0);
          const subtotal = linea.cantidad * precioUnitario;
          
          doc.text(`${linea.cantidad}x ${linea.producto.nombre}`, 10, y);
          doc.text(`${subtotal.toFixed(2)}€`, 160, y, { align: 'right' });
          
          if (linea.modificacion) {
            y += 5;
            doc.setFontSize(10);
            doc.text(`  Nota: ${linea.modificacion}`, 10, y);
            doc.setFontSize(12);
          }
          y += 10;
        });
      }
      
      doc.setLineWidth(0.5);
      doc.line(10, y, 200, y);
      y += 10;
      doc.setFontSize(14);
      doc.text(`TOTAL A PAGAR: ${totalCalculado.toFixed(2)}€`, 10, y);

      doc.save(`ticket_${pedido.ubicacion.replace(/\s/g, '_')}_${id}.pdf`);

      // Informamos al backend que el ticket ya se ha sacado
      this.pedidoService.actualizarEstado(id, 'listo para cobrar').subscribe({
        next: () => {
          alert('Ticket generado correctamente.');
          this.cargarPedidos();
        },
        error: (err) => console.error('Error al actualizar estado:', err)
      });
    } catch (e) {
      console.error('Error durante la generación del PDF:', e);
      alert('Hubo un problema al generar el ticket. Revisa la consola.');
    }
  }

  /**
   * Marca como pagado definitivamente (Archivar).
   */
  finalizarYarchivar(id: number): void {
    const confirmacion = confirm('¿Confirmas el pago del cliente? El pedido desaparecerá de esta lista.');
    if (confirmacion) {
      this.pedidoService.marcarComoPagado(id, 'EFECTIVO/TARJETA').subscribe({
        next: () => {
          alert('Pedido archivado con éxito.');
          this.cargarPedidos();
        },
        error: (err) => {
          console.error('Error al archivar:', err);
          alert('No se pudo procesar el pago en el servidor.');
        }
      });
    }
  }

  /**
   * Elimina el pedido (Solo si hay errores graves o cancelaciones).
   */
  eliminarPedido(id: number) {
    if (confirm('¿ESTÁS SEGURO? Esta acción borrará la comanda de forma permanente.')) {
      this.pedidoService.delete(id).subscribe({
        next: () => {
          alert('Pedido eliminado.');
          this.pedidos = this.pedidos.filter(p => p.id !== id);
        },
        error: (err) => {
          if (err.status === 403) {
            alert('Error: No se permite eliminar pedidos que ya están en proceso.');
          } else {
            alert('Error al eliminar. Comprueba la conexión.');
          }
        }
      });
    }
  }
}