import { Component, OnInit } from '@angular/core';
import { Producto } from 'src/app/interfaces/producto';
import { ProductoIngrediente } from 'src/app/interfaces/producto-ingrediente';
import { ProductoService } from 'src/app/services/producto.service';
import { ProductoIngredienteService } from 'src/app/services/producto-ingrediente.service';
import { Router } from '@angular/router';

interface ProductoConIngredientes extends Producto {
  ingredientes: ProductoIngrediente[];
}

@Component({
  selector: 'app-producto-lista',
  templateUrl: './producto-lista.component.html',
  styleUrls: ['./producto-lista.component.css']
})
export class ProductoListaComponent implements OnInit {
  productos: ProductoConIngredientes[] = [];

  constructor(
    private productoService: ProductoService,
    private productoIngredienteService: ProductoIngredienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoService.getAll().subscribe(productos => {
      this.productoIngredienteService.getAll().subscribe(relaciones => {
        this.productos = productos.map(producto => ({
          ...producto,
          ingredientes: relaciones.filter(pi => pi.producto.id === producto.id)
        }));
      });
    });
  }

  editarProducto(producto: Producto) {
    this.router.navigate(['/barra/productos/editar', producto.id]);
  }

eliminarProducto(id: number) {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    this.productoService.delete(id).subscribe(() => {
      this.productos = this.productos.filter(p => p.id !== id);
    });
  }
}


}
