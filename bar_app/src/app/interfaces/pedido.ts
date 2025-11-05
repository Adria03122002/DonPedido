import { LineaPedido } from './linea-pedido';
import { Ubicacion } from './ubicacion';

export interface Pedido {
  id: number;
  ubicacion?: Ubicacion;
  estado: string;
  fecha: string;
  total: number;
  lineas?: LineaPedido[];
  pagado: boolean;
  formaPago?: string;
  nombreCliente?: string | null;
}

export interface CrearPedidoPayload {
  ubicacion: { numero: number | null; tipo: string; };
  nombreCliente: string | null;  
  estado: string;
  fecha: string;
  pagado: boolean;
  lineas: { cantidad: number; producto: { id: number; }; modificacion: string; }[];
}