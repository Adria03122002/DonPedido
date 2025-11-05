import { Producto } from './producto';
import { Pedido } from './pedido';

export interface LineaPedido {
  id: number;
  producto: Producto;
  cantidad: number;
  modificacion?: string;
  pedido: Pedido;
}