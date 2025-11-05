import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pedido } from './Pedido';
import { Producto } from './Producto';

@Entity('lineapedido')
export class LineaPedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto)
  producto: Producto;

  @Column({ default: 1 })
  cantidad: number;

  @Column({ nullable: true })
  modificacion: string;

  @ManyToOne(() => Pedido, pedido => pedido.lineas, {
    onDelete: "CASCADE"
  })
  pedido: Pedido;

}
