import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProductoIngrediente } from "./ProductoIngrediente";

@Entity('Ingrediente')
export class Ingrediente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cantidad: number;

  @Column({ default: 'unidad' }) // kg, g, ml, litros...
  unidad: string;

  @Column({ default: true })
  disponible: boolean;

  @Column({ nullable: true })
  tipo: string;

  @OneToMany(() => ProductoIngrediente, (pi) => pi.ingrediente)
  productosDondeSeUsa: ProductoIngrediente[];
}