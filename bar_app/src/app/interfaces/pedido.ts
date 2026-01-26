import { LineaPedido } from './linea-pedido';

export interface Pedido {
  id: number;
  ubicacion: string;
  estado: string;
  fecha: string;
  total: number;
  lineas?: LineaPedido[];
  pagado: boolean;
  nombreCliente?: string; 
}

export interface CrearPedidoPayload {
  ubicacion: string;
  estado: string;
  fecha: string;
  pagado: boolean;
  lineas: {
    cantidad: number;
    producto: { id: number };
    modificacion: string;
  }[];
  nombreCliente?: string; 
}