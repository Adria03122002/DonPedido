import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductoIngrediente } from './ProductoIngrediente';

@Entity('Producto')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tipo: string;

  @Column('decimal')
  precio: number;

  @Column({ nullable: true , default: ""}) 
  imagenUrl: string;

  @Column({ default: true })
  disponible: boolean;

  @Column({ type: 'int', nullable: true, default: null })
  stock: number | null;

  @OneToMany(() => ProductoIngrediente, pi => pi.producto)
  ingredientes: ProductoIngrediente[];
}
