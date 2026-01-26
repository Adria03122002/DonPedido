import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-crear-pedido',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './crear-pedido.component.html',
  styleUrls: ['./crear-pedido.component.css']
})
export class CrearPedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService); 

  ubicacion = signal<string>('');
  nombreCliente = signal<string>('');
  productos = signal<any[]>([]);
  categorias = ['Hamburguesas', 'Bebidas', 'Entrantes', 'Postres'];
  categoriaActiva = signal('Hamburguesas');
  lineasPedido = signal<any[]>([]);

  ngOnInit() {
    this.obtenerParametrosRuta();
    this.cargarProductos();
  }

  private obtenerParametrosRuta() {
    this.route.queryParams.subscribe(params => {
      this.ubicacion.set(params['mesa'] || 'Barra');
      this.nombreCliente.set(params['cliente'] || '');
    });
  }

  private cargarProductos() {
    this.productoService.getAll().subscribe(res => {
      this.productos.set(res.filter(p => p.disponible));
    });
  }

  agregarProducto(prod: any) {
    const actual = this.lineasPedido();
    const existe = actual.find(l => l.productoId === prod.id);
    
    if (existe) {
      existe.cantidad++;
      this.lineasPedido.set([...actual]);
    } else {
      this.lineasPedido.update(prev => [...prev, {
        productoId: prod.id, 
        nombre: prod.nombre, 
        precio: prod.precio, 
        cantidad: 1
      }]);
    }
  }

  get totalComanda() {
    return this.lineasPedido().reduce((acc, l) => acc + (l.precio * l.cantidad), 0);
  }

  private redirigirSegunRol() {
    const rol = this.authService.getUserRole();
    console.log("Rol detectado para navegación:", rol); 
    
    if (rol === 'Camarero') {
      this.router.navigate(['/camarero']);
    } else {
      this.router.navigate(['/barra/pedidos']);
    }
  }

  enviarPedido() {
    if (this.lineasPedido().length === 0) {
      console.warn("No se puede enviar un pedido sin productos.");
      return; 
    }

    const payload = {
      ubicacion: this.ubicacion(),
      nombreCliente: this.nombreCliente() || 'Cliente General',
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      pagado: false,
      lineas: this.lineasPedido().map(l => ({
        productoId: l.productoId,
        cantidad: l.cantidad
      }))
    };

    this.pedidoService.crearPedido(payload as any).subscribe({
      next: () => {
        this.redirigirSegunRol();
      },
      error: (err) => {
        console.error("Error al crear el pedido:", err);
      }
    });
  }
}