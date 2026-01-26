import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { AuthService } from 'src/app/services/auth.service'; // Importamos AuthService
import { Producto } from 'src/app/interfaces/producto';

@Component({
  selector: 'app-modificar-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modificar-pedido.component.html',
  styleUrls: ['./modificar-pedido.component.css']
})
export class ModificarPedidoComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService); // Inyectamos el servicio de autenticación
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // --- ESTADO DEL COMPONENTE ---
  pedidoId: number | null = null;
  esNuevo: boolean = true;

  // --- DATOS DEL PEDIDO ---
  ubicacion: string = 'Cargando...';
  nombreCliente: string = '';
  lineasPedido: any[] = [];
  
  // --- CATÁLOGO ---
  productosMenu: Producto[] = [];

  ngOnInit(): void {
    // 1. Cargar el catálogo completo de productos disponibles
    this.productoService.getAll().subscribe({
      next: (prods) => {
        this.productosMenu = prods.filter(p => p.disponible);
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });

    // 2. Detectar si recibimos un ID por la URL para entrar en modo edición
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.pedidoId = Number(idParam);
      this.esNuevo = false;
      this.cargarDatosDelPedido(this.pedidoId);
    } else {
      this.ubicacion = 'Nueva Comanda';
    }
  }

  cargarDatosDelPedido(id: number) {
    this.pedidoService.getPedidos().subscribe({
      next: (todos) => {
        const pedido = todos.find(p => p.id === id);
        if (pedido) {
          this.ubicacion = pedido.ubicacion;
          this.nombreCliente = pedido.nombreCliente || 'Cliente';
          
          this.lineasPedido = (pedido.lineas || []).map((l: any) => ({
            ...l,
            producto: { ...l.producto }
          }));
        } else {
          console.error("No se encontró el pedido con ID:", id);
          this.volver();
        }
      },
      error: (err) => console.error("Error al obtener detalles del pedido:", err)
    });
  }

  agregarProducto(producto: Producto) {
    const lineaExistente = this.lineasPedido.find(l => l.producto.id === producto.id);
    
    if (lineaExistente) {
      lineaExistente.cantidad++;
    } else {
      this.lineasPedido.push({
        producto: { ...producto },
        cantidad: 1,
        modificacion: ''
      });
    }
  }

  cambiarCantidad(index: number, delta: number) {
    const nuevaCantidad = this.lineasPedido[index].cantidad + delta;
    
    if (nuevaCantidad > 0) {
      this.lineasPedido[index].cantidad = nuevaCantidad;
    } else {
      this.eliminarLinea(index);
    }
  }

  eliminarLinea(index: number) {
    this.lineasPedido.splice(index, 1);
  }

  calcularTotal(): number {
    return this.lineasPedido.reduce((acc, l) => {
      const precio = Number(l.producto?.precio || 0);
      return acc + (l.cantidad * precio);
    }, 0);
  }

  /**
   * LÓGICA DE REDIRECCIÓN SEGÚN ROL
   * Evita que el camarero acceda a la vista de administración
   */
  private redirigirSegunRol() {
    const rol = this.authService.getUserRole()?.toLowerCase();
    
    if (rol === 'camarero') {
      // Si es camarero, vuelve a su mapa de mesas independiente
      this.router.navigate(['/camarero']);
    } else {
      // Si es admin/barra, vuelve al listado de pedidos de administración
      this.router.navigate(['/barra/pedidos']);
    }
  }

  guardar() {
    if (this.lineasPedido.length === 0) return;

    const payload = {
      ubicacion: this.ubicacion,
      nombreCliente: this.nombreCliente,
      lineas: this.lineasPedido.map(l => ({
        productoId: l.producto.id,
        cantidad: l.cantidad,
        modificacion: l.modificacion
      }))
    };

    if (this.esNuevo) {
      this.pedidoService.crearPedido(payload as any).subscribe({
        next: () => {
          alert('Comanda enviada a cocina');
          this.redirigirSegunRol();
        },
        error: (err) => alert('Error al crear: ' + err.message)
      });
    } else if (this.pedidoId) {
      this.pedidoService.updatePedido(this.pedidoId, payload).subscribe({
        next: () => {
          alert('Comanda actualizada correctamente');
          this.redirigirSegunRol();
        },
        error: (err) => alert('Error al actualizar: ' + err.message)
      });
    }
  }

  volver() {
    this.redirigirSegunRol();
  }

  getEmoji(tipo: string): string {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('bebida') || t.includes('refresco')) return '🍺';
    if (t.includes('comida') || t.includes('hamburguesa') || t.includes('tapa')) return '🍔';
    if (t.includes('postre') || t.includes('dulce')) return '🍰';
    if (t.includes('cafe') || t.includes('infusion')) return '☕';
    return '🍽️';
  }
}