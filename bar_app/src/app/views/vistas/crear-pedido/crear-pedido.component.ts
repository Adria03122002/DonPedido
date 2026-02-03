import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  ubicacion = signal<string>('Barra');
  nombreCliente = signal<string>('');
  todosLosProductos = signal<any[]>([]);
  categorias = ['Bebidas','Hamburguesas', 'Entrantes', 'Postres', 'Otros'];
  categoriaActiva = signal('Bebidas');
  lineasPedido = signal<any[]>([]);

  // NUEVO: Signal para controlar qué producto estamos consultando
  productoSeleccionadoParaInfo = signal<any | null>(null);

  productosFiltrados = computed(() => {
    const filtro = this.categoriaActiva().toLowerCase();
    return this.todosLosProductos().filter(p => {
      const tipoProd = (p.tipo || 'otros').toLowerCase();
      if (filtro === 'hamburguesas') return tipoProd.includes('hamburguesa');
      if (filtro === 'bebidas') return tipoProd.includes('bebida');
      if (filtro === 'entrantes') return tipoProd.includes('entrante');
      if (filtro === 'postres') return tipoProd.includes('postre');
      if (filtro === 'otros') {
          const conocidas = ['hamburguesa', 'bebida', 'entrante', 'postre'];
          return !conocidas.some(c => tipoProd.includes(c));
      }
      return tipoProd === filtro;
    });
  });

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
      this.todosLosProductos.set(res.filter(p => p.disponible));
    });
  }

  setCategoria(cat: string) {
    this.categoriaActiva.set(cat);
  }

  // MODIFICADO: Ahora aceptamos un evento opcional para detener la propagación
  agregarProducto(prod: any, event?: MouseEvent) {
    if (event) event.stopPropagation(); // Evita que se abra la info si solo queremos añadir
    
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

  // NUEVO: Método para abrir el modal de información
  verInfo(event: MouseEvent, prod: any) {
    event.stopPropagation(); 
    this.productoSeleccionadoParaInfo.set(prod);
  }

  // NUEVO: Método para cerrar el modal
  cerrarInfo() {
    this.productoSeleccionadoParaInfo.set(null);
  }

  quitarProducto(index: number) {
    this.lineasPedido.update(prev => {
      const nueva = [...prev];
      if (nueva[index].cantidad > 1) nueva[index].cantidad--;
      else nueva.splice(index, 1);
      return nueva;
    });
  }

  get totalComanda() {
    return this.lineasPedido().reduce((acc, l) => acc + (l.precio * l.cantidad), 0);
  }

  private redirigirSegunRol() {
    const user = this.authService.currentUser();
    const rol = (user?.rol || '').toString().toLowerCase();
    if (rol.includes('camarero')) this.router.navigate(['/barra/mapa-mesas']);
    else this.router.navigate(['/barra/pedidos']);
  }

  cancelar() { this.redirigirSegunRol(); }

  enviarPedido() {
    if (this.lineasPedido().length === 0) return;
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
      next: () => this.redirigirSegunRol(),
      error: (err) => console.error(err)
    });
  }
}