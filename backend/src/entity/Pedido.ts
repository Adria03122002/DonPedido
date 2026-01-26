import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { LineaPedido } from './LineaPedido';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string;

  @Column()
  estado: string; // 'en preparación', 'servido', etc.

  @CreateDateColumn()
  fecha: Date;

  @Column({ default: false })
  pagado: boolean;

  @Column({ nullable: true })
  nombreCliente!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @OneToMany(() => LineaPedido, linea => linea.pedido, {
    cascade: true,
    onDelete: "CASCADE",
  })
  lineas: LineaPedido[];
}
