// Reemplaza TODO tu componente con esto:
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

        // Cargar las relaciones manualmente
        this.productoIngredienteService.getAll().subscribe(relaciones => {
          const relacionesDelProducto = relaciones.filter(pi => pi.producto.id === producto.id);

          this.ingredientesSeleccionados = relacionesDelProducto.map(pi => pi.ingrediente.id);

          this.cantidades = {};
          relacionesDelProducto.forEach(pi => {
            this.cantidades[pi.ingrediente.id] = pi.cantidadNecesaria;
          });
        });
      });
    }

    this.cargarIngredientes();
  }

  tiposProducto: string[] = [
    'hamburguesa',
    'bocadillo',
    'pizza',
    'ensalada',
    'ración',
    'pasta',           // <--- NUEVO
    'plato_combinado', // <--- NUEVO
    'sopa_crema',      // <--- NUEVO
    'postre',
    'pastelería',      // <--- NUEVO
    'helado',          // <--- NUEVO
    'desayuno',
    'cafetería',
    'cerveza',         // <--- NUEVO (Clasificación de bebidas)
    'vino',            // <--- NUEVO
    'zumo_refresco',   // <--- NUEVO
    'extra',           // <--- NUEVO (Para guarniciones/salsas)
    'refresco',
    'otros'
  ];



  tiposExcluidos: string[] = ['alcohol', 'refrescos'];

  nuevoProducto: Producto = {} as Producto;

  ingredientes: Ingrediente[] = [];
  ingredientesSeleccionados: number[] = [];
  cantidades: { [ingredienteId: number]: number } = {};

  cargarIngredientes(): void {
    this.ingredienteService.getAll().subscribe(data => {
      this.ingredientes = data;
    });
  }

  ingredienteSeleccionado(id: number): boolean {
    return this.ingredientesSeleccionados.includes(id);
  }

  toggleIngrediente(id: number): void {
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

      for (const id of this.ingredientesSeleccionados) {
          const cantidad = this.cantidades[id];
          
          if (cantidad == null || cantidad <= 0) {
              
              const ingrediente = this.ingredientes.find(i => i.id === id);
              
              alert(`ERROR: La cantidad necesaria para ${ingrediente?.nombre || 'un ingrediente seleccionado'} debe ser un número positivo.`);
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
