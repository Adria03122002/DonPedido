import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductoService } from 'src/app/services/producto.service';
import { ProductoIngredienteService } from 'src/app/services/producto-ingrediente.service';
import { Producto } from 'src/app/interfaces/producto';
import { ProductoIngrediente } from 'src/app/interfaces/producto-ingrediente';

interface ProductoConIngredientes extends Producto {
  ingredientes: ProductoIngrediente[];
}

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-lista.component.html',
  styleUrls: ['./producto-lista.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoListaComponent implements OnInit {
  private productoService = inject(ProductoService);
  private productoIngredienteService = inject(ProductoIngredienteService);
  private router = inject(Router);

  private _productos = signal<ProductoConIngredientes[]>([]);
  private _productoAEliminarId = signal<number | null>(null);

  get productos() { return this._productos(); }
  get productoAEliminarId() { return this._productoAEliminarId(); }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.productoIngredienteService.getAll().subscribe({
          next: (relaciones) => {
            const listaCompleta = productos.map(producto => ({
              ...producto,
              ingredientes: relaciones.filter(pi => pi.producto.id === producto.id)
            }));
            this._productos.set(listaCompleta);
          },
          error: (err) => console.error('Error al cargar ingredientes:', err)
        });
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  editarProducto(producto: Producto): void {
    this.router.navigate(['/barra/productos/editar', producto.id]);
  }


  eliminarProducto(id: number): void {
    this._productoAEliminarId.set(id);
  }


  confirmarEliminacion(): void {
    const id = this._productoAEliminarId();
    if (id !== null) {
      this.productoService.delete(id).subscribe({
        next: () => {
          this._productos.update(prev => prev.filter(p => p.id !== id));
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.cerrarModal();
        }
      });
    }
  }

  cerrarModal(): void {
    this._productoAEliminarId.set(null);
  }

  getEmoji(tipo: string): string {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('bebida')) return '🍺';
    if (t.includes('hamburguesa')) return '🍔';
    if (t.includes('entrante')) return '🍟';
    if (t.includes('postre')) return '🍰';
    return '🍽️';
  }
}