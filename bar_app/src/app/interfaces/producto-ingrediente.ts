import { Producto } from './producto';
import { Ingrediente } from './ingrediente';

export interface ProductoIngrediente {
  id: number;
  producto: Producto;
  ingrediente: Ingrediente;
  cantidadNecesaria: number;
}
