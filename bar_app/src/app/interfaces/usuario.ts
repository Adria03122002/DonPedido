export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol: {
    id: number;
    nombre: string;
  } | string; 
}