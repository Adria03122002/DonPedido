

export interface Producto {
  id: number;
  nombre: string;
  tipo: string;
  precio: number;
  imagenUrl: string;
  disponible: boolean;
  stock?: number | null;
}