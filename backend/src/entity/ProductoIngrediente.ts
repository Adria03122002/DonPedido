import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Producto } from './Producto';
import { Ingrediente } from './Ingrediente';

@Entity('ProductoIngrediente')
export class ProductoIngrediente {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, producto => producto.ingredientes, {
    onDelete: 'CASCADE'
  })
  producto: Producto;

  @ManyToOne(() => Ingrediente)
  ingrediente: Ingrediente;

  @Column({ type: 'int', default: 1 })
  cantidadNecesaria: number;
}
