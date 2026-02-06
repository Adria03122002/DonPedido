import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto } from 'src/app/interfaces/producto';
import { LineaPedido } from 'src/app/interfaces/linea-pedido';
import { ProductoIngrediente } from 'src/app/interfaces/producto-ingrediente';


@Component({
  selector: 'app-crear-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-pedido.component.html',
  styleUrls: ['./crear-pedido.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class CrearPedidoComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private _pedidoId = signal<number | null>(null);
  private _esNuevo = signal<boolean>(true);
  private _ubicacion = signal<string>('Cargando...');
  private _nombreCliente = signal<string>('');
  private _lineasPedido = signal<LineaPedido[]>([]);
  private _productosMenu = signal<Producto[]>([]);
  private _categoriaActiva = signal<string>('Todos');

  private _productoSeleccionadoParaInfo = signal<any | null>(null);

  // --- GETTERS PARA EL HTML ---
  get pedidoId() { return this._pedidoId(); }
  get esNuevo() { return this._esNuevo(); }
  get ubicacion() { return this._ubicacion(); }
  get nombreCliente() { return this._nombreCliente(); }
  get lineasPedido() { return this._lineasPedido(); }
  get categoriaActiva() { return this._categoriaActiva(); }
  get productoSeleccionadoParaInfo() { return this._productoSeleccionadoParaInfo(); }

  categorias: string[] = ['Todos', 'Hamburguesas', 'Bebidas', 'Entrantes', 'Postres', 'Café'];

  private _productosFiltrados = computed(() => {
    const activa = this._categoriaActiva().toLowerCase();
    const prods = this._productosMenu();
    
    if (activa === 'todos') return prods;
    
    return prods.filter(p => {
      const tipo = p.tipo?.toLowerCase() || '';
      if (activa === 'hamburguesas') return tipo.includes('hamburguesa');
      if (activa === 'bebidas') return tipo.includes('bebida') || tipo.includes('refresco');
      if (activa === 'entrantes') return tipo.includes('entrante') || tipo.includes('tapa');
      if (activa === 'postres') return tipo.includes('postre') || tipo.includes('dulce');
      if (activa === 'café') return tipo.includes('cafe') || tipo.includes('infusion');
      return tipo === activa;
    });
  });

  get productosFiltrados() { return this._productosFiltrados(); }

  ngOnInit(): void {
    this.cargarCatalogo();
    this.detectarModo();
  }

  private cargarCatalogo() {
    this.productoService.getAll().subscribe({
      next: (prods) => {
        this._productosMenu.set(prods.filter(p => p.disponible));
      },
      error: (err) => console.error('Error al cargar catálogo:', err)
    });
  }

  private detectarModo() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this._pedidoId.set(Number(idParam));
      this._esNuevo.set(false);
      this.cargarDatosDelPedido(Number(idParam));
    } else {
      this.route.queryParams.subscribe(params => {
        this._ubicacion.set(params['mesa'] || 'Nueva Comanda');
        this._nombreCliente.set(params['cliente'] || '');
      });
    }
  }

  cargarDatosDelPedido(id: number) {
    this.pedidoService.getPedidos().subscribe({
      next: (todos) => {
        const pedido = todos.find(p => p.id === id);
        if (pedido) {
          this._ubicacion.set(pedido.ubicacion);
          this._nombreCliente.set(pedido.nombreCliente || 'Cliente');
          this._lineasPedido.set((pedido.lineas || []).map((l: any) => ({
            ...l,
            producto: { ...l.producto }
          })));
        }
      }
    });
  }

  setCategoria(cat: string) {
    this._categoriaActiva.set(cat);
  }


  agregarProducto(producto: Producto) {
    this._lineasPedido.update(actuales => {
      const existe = actuales.find(l => l.producto.id === producto.id);
      if (existe) {
        existe.cantidad++;
        return [...actuales];
      }
      
      const nuevaLinea = { 
        producto: { ...producto }, 
        cantidad: 1, 
        modificacion: '' 
      } as LineaPedido;

      return [...actuales, nuevaLinea];
    });
  }

  cambiarCantidad(index: number, delta: number) {
    this._lineasPedido.update(actuales => {
      const nuevaCant = actuales[index].cantidad + delta;
      if (nuevaCant <= 0) {
        actuales.splice(index, 1);
      } else {
        actuales[index].cantidad = nuevaCant;
      }
      return [...actuales];
    });
  }

  eliminarLinea(index: number) {
    this._lineasPedido.update(actuales => actuales.filter((_, i) => i !== index));
  }

  calcularTotal(): number {
    return this._lineasPedido().reduce((acc, l) => {
        const precio = Number(l.producto?.precio || 0);
        return acc + (l.cantidad * precio);
    }, 0);
  }


  
  verInfo(event: MouseEvent, prod: Producto) {
    event.stopPropagation(); 
    this._productoSeleccionadoParaInfo.set(prod);
  }

  cerrarInfo() {
    this._productoSeleccionadoParaInfo.set(null);
  }

  

  guardar() {
    if (this._lineasPedido().length === 0) return;
    const payload = {
      ubicacion: this._ubicacion(),
      nombreCliente: this._nombreCliente(),
      lineas: this._lineasPedido().map(l => ({
        productoId: l.producto.id,
        cantidad: l.cantidad,
        modificacion: l.modificacion
      }))
    };

    const request = this._esNuevo() 
      ? this.pedidoService.crearPedido(payload as any)
      : this.pedidoService.updatePedido(this._pedidoId()!, payload);

    request.subscribe({ next: () => this.volver() });
  }

  private redirigirSegunRol() {
    const rol = this.authService.getUserRole()?.toLowerCase();
    const path = rol === 'camarero' ? '/barra/mapa-mesas' : '/barra/pedidos';
    this.router.navigate([path]);
  }

  volver() { this.redirigirSegunRol(); }

  getEmoji(tipo: string): string {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('bebida')) return '🍺';
    if (t.includes('hamburguesa')) return '🍔';
    if (t.includes('entrante')) return '🍟';
    if (t.includes('postre')) return '🍰';
    if (t.includes('cafe')) return '☕';
    return '🍽️';
  }
}