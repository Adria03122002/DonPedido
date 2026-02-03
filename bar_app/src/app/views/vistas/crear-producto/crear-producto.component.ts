import { Component, OnInit } from '@angular/core';
import { Producto } from 'src/app/interfaces/producto';
import { Ingrediente } from 'src/app/interfaces/ingrediente';
import { ProductoIngrediente } from 'src/app/interfaces/producto-ingrediente';
import { ProductoService } from 'src/app/services/producto.service';
import { IngredienteService } from 'src/app/services/ingrediente.service';
import { ProductoIngredienteService } from 'src/app/services/producto-ingrediente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {

  esEdicion: boolean = false;
  nuevoProducto: Producto = {
    id: 0,
    nombre: '',
    tipo: '',
    precio: 0,
    imagenUrl: '',
    disponible: true,
    stock: null
  } as Producto;

  ingredientes: Ingrediente[] = [];
  ingredientesSeleccionados: number[] = [];
  cantidades: { [ingredienteId: number]: number } = {};

  tiposExcluidos = ['bebida', 'complemento'];
  tiposProducto: string[] = [
    'hamburguesa', 'bocadillo', 'pizza', 'ensalada', 'ración', 'pasta',
    'plato_combinado', 'sopa_crema', 'postre', 'pastelería', 'helado',
    'desayuno', 'cafetería', 'cerveza', 'vino', 'zumo_refresco', 'extra',
    'refresco', 'entrantes', 'otros'
  ];

  constructor(
    private productoService: ProductoService,
    private ingredienteService: IngredienteService,
    private productoIngredienteService: ProductoIngredienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.esEdicion = true;
      this.cargarProducto(Number(id));
    }

    this.cargarIngredientes();
  }

  cargarProducto(id: number): void {
    this.productoService.getOne(id).subscribe(producto => {
      this.nuevoProducto = producto;

      this.productoIngredienteService.getAll().subscribe(relaciones => {
        const relacionesDelProducto = relaciones.filter(pi => pi.producto.id === producto.id);

        this.ingredientesSeleccionados = relacionesDelProducto
          .map(pi => pi.ingrediente?.id)
          .filter((id): id is number => typeof id === 'number');

        this.cantidades = {};
        relacionesDelProducto.forEach(pi => {
          const ingredienteId = pi.ingrediente?.id;
          if (typeof ingredienteId === 'number') {
            this.cantidades[ingredienteId] = pi.cantidadNecesaria;
          }
        });
      });
    });
  }

  cargarIngredientes(): void {
    this.ingredienteService.getAll().subscribe(data => {
      this.ingredientes = data;
    });
  }

  ingredienteSeleccionado(id: number | undefined): boolean {
    if (id === undefined) return false;
    return this.ingredientesSeleccionados.includes(id);
  }

  toggleIngrediente(id: number | undefined): void {
    if (id === undefined) return;

    if (this.ingredienteSeleccionado(id)) {
      this.ingredientesSeleccionados = this.ingredientesSeleccionados.filter(i => i !== id);
      delete this.cantidades[id];
    } else {
      this.ingredientesSeleccionados.push(id);
      this.cantidades[id] = 1;
    }
  }

  guardar(): void {
    if (this.ingredientesSeleccionados.length === 0) {
      alert('ADVERTENCIA: Debes seleccionar al menos un ingrediente.');
      return;
    }

    for (const id of this.ingredientesSeleccionados) {
      if (!this.cantidades[id] || this.cantidades[id] <= 0) {
        const ing = this.ingredientes.find(i => i.id === id);
        alert(`ERROR: La cantidad para ${ing?.nombre} debe ser mayor a 0.`);
        return;
      }
    }

    if (this.esEdicion) {
      this.actualizarExistente();
    } else {
      this.crearNuevo();
    }
  }

  private crearNuevo(): void {
    this.productoService.create(this.nuevoProducto).subscribe(productoCreado => {
      this.guardarRelacionesIngredientes(productoCreado);
      alert('Producto creado correctamente');
      this.router.navigate(['/barra/productos']);
    });
  }

  private actualizarExistente(): void {
    this.productoService.update(this.nuevoProducto.id, this.nuevoProducto).subscribe(productoActualizado => {
      this.guardarRelacionesIngredientes(productoActualizado);
      alert('Producto actualizado correctamente');
      this.router.navigate(['/barra/productos']);
    });
  }

  private guardarRelacionesIngredientes(producto: Producto): void {
    const relaciones: ProductoIngrediente[] = this.ingredientesSeleccionados.map(id => ({
      id: 0,
      producto: producto,
      ingrediente: this.ingredientes.find(i => i.id === id)!,
      cantidadNecesaria: this.cantidades[id]
    }));

    relaciones.forEach(relacion => {
      this.productoIngredienteService.create(relacion).subscribe();
    });
  }

  resetFormulario(): void {
    this.nuevoProducto = { id: 0, nombre: '', tipo: '', precio: 0, imagenUrl: '', disponible: true, stock: null } as Producto;
    this.ingredientesSeleccionados = [];
    this.cantidades = {};
    this.esEdicion = false;
  }
}