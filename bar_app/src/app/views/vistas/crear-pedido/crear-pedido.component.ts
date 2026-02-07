import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { AuthService } from 'src/app/services/auth.service';
import { Producto } from 'src/app/interfaces/producto';
import { LineaPedido } from 'src/app/interfaces/linea-pedido';

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

  // --- ESTADOS PRIVADOS (Signals) ---
  private _pedidoId = signal<number | null>(null);
  private _esNuevo = signal<boolean>(true);
  private _ubicacion = signal<string>('Cargando...');
  private _nombreCliente = signal<string>('');
  private _lineasPedido = signal<any[]>([]); 
  private _productosMenu = signal<Producto[]>([]);
  private _categoriaActiva = signal<string>('Todos');
  private _productoSeleccionadoParaInfo = signal<Producto | null>(null);

  // --- GETTERS PARA EL HTML (Permiten usar las variables sin paréntesis) ---
  get pedidoId() { return this._pedidoId(); }
  get esNuevo() { return this._esNuevo(); }
  get ubicacion() { return this._ubicacion(); }
  get nombreCliente() { return this._nombreCliente(); }
  get lineasPedido() { return this._lineasPedido(); }
  get categoriaActiva() { return this._categoriaActiva(); }
  get productoSeleccionadoParaInfo() { return this._productoSeleccionadoParaInfo(); }
  get productosFiltrados() { return this._productosFiltrados(); }

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
          const lineasBase = pedido.lineas || [];
          this._lineasPedido.set(lineasBase.map((l: any) => ({
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

  // --- LÓGICA DE FICHA TÉCNICA (LA "VISA") ---
  verInfo(event: MouseEvent, prod: Producto) {
    event.stopPropagation(); // Evita que se añada el producto al hacer clic en el botón 'i'
    this._productoSeleccionadoParaInfo.set(prod);
  }

  cerrarInfo() {
    this._productoSeleccionadoParaInfo.set(null);
  }

  // --- ACCIONES DEL TPV (Inmutabilidad para corregir contadores) ---
  agregarProducto(producto: Producto) {
    this._lineasPedido.update(actuales => {
      const indice = actuales.findIndex(l => l.producto.id === producto.id);
      
      if (indice > -1) {
        const nuevas = [...actuales];
        nuevas[indice] = { ...nuevas[indice], cantidad: nuevas[indice].cantidad + 1 };
        return nuevas;
      }
      
      return [...actuales, { producto: { ...producto }, cantidad: 1, modificacion: '' }];
    });
  }

  cambiarCantidad(index: number, delta: number) {
    this._lineasPedido.update(actuales => {
      const nuevas = [...actuales];
      const nuevaCant = nuevas[index].cantidad + delta;

      if (nuevaCant <= 0) {
        return nuevas.filter((_, i) => i !== index);
      }
      
      nuevas[index] = { ...nuevas[index], cantidad: nuevaCant };
      return nuevas;
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

  volver() {
    const rol = this.authService.getUserRole()?.toLowerCase();
    const path = rol === 'camarero' ? '/barra/mapa-mesas' : '/barra/pedidos';
    this.router.navigate([path]);
  }

  getEmoji(t: string): string {
    const tipo = t?.toLowerCase() || '';
    if (tipo.includes('bebida')) return '🍺';
    if (tipo.includes('hamburguesa')) return '🍔';
    if (tipo.includes('entrante')) return '🍟';
    if (tipo.includes('postre')) return '🍰';
    if (tipo.includes('cafe')) return '☕';
    return '🍽️';
  }
}