import { Component, OnInit } from '@angular/core';
import { Producto } from 'src/app/interfaces/producto';
import { Ingrediente } from 'src/app/interfaces/ingrediente';
import { ProductoIngrediente } from 'src/app/interfaces/producto-ingrediente';
import { ProductoService } from 'src/app/services/producto.service';
import { IngredienteService } from 'src/app/services/ingrediente.service';
import { ProductoIngredienteService } from 'src/app/services/producto-ingrediente.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {

  constructor(
    private productoService: ProductoService,
    private ingredienteService: IngredienteService,
    private route: ActivatedRoute,
    private productoIngredienteService: ProductoIngredienteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productoService.getOne(+id).subscribe(producto => {
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

    this.cargarIngredientes();
  }

  tiposExcluidos = ['bebida', 'complemento'];

  tiposProducto: string[] = [
    'hamburguesa', 'bocadillo', 'pizza', 'ensalada', 'ración', 'pasta',
    'plato_combinado', 'sopa_crema', 'postre', 'pastelería', 'helado',
    'desayuno', 'cafetería', 'cerveza', 'vino', 'zumo_refresco', 'extra',
    'refresco', 'otros'
  ];

  nuevoProducto: Producto = {} as Producto;
  ingredientes: Ingrediente[] = [];
  ingredientesSeleccionados: number[] = [];
  cantidades: { [ingredienteId: number]: number } = {};

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
      this.cantidades[id] = 1; // valor inicial
    }
  }

  crearProducto(): void {
    if (this.ingredientesSeleccionados.length === 0) {
      alert('ADVERTENCIA: Debes seleccionar al menos un ingrediente para crear la receta del producto.');
      return;
    }

    // Validación de cantidades
    for (const id of this.ingredientesSeleccionados) {
      const cantidad = this.cantidades[id];
      if (cantidad == null || cantidad <= 0) {
        const ingrediente = this.ingredientes.find(i => i.id === id);
        alert(`ERROR: La cantidad necesaria para ${ingrediente?.nombre || 'un ingrediente'} debe ser un número positivo.`);
        return;
      }
    }

    const productoAEnviar: Producto = { ...this.nuevoProducto };
    this.productoService.create(productoAEnviar).subscribe(productoCreado => {
      
      const relaciones: ProductoIngrediente[] = this.ingredientesSeleccionados.map(id => ({
        id: 0,
        producto: productoCreado,
        ingrediente: this.ingredientes.find(i => i.id === id)!,
        cantidadNecesaria: this.cantidades[id] 
      }));

      // Guardar cada relación
      relaciones.forEach(relacion => {
        this.productoIngredienteService.create(relacion).subscribe();
      });

      alert('Producto creado correctamente');
      this.resetFormulario();
    });
  }

  resetFormulario(): void {
    this.nuevoProducto = {
      id: 0,
      nombre: '',
      tipo: '',
      precio: 0,
      imagenUrl: '',
      disponible: true,
      stock: null
    };
    this.ingredientesSeleccionados = [];
    this.cantidades = {};
  }
}