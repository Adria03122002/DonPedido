import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Ubicacion } from './Ubicacion';
import { LineaPedido } from './LineaPedido';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ubicacion, { nullable: true })
  ubicacion: Ubicacion;

  @Column()
  estado: string; // 'en preparación', 'servido', etc.

  @CreateDateColumn()
  fecha: Date;

  @Column({default: false})
  pagado: boolean;

  @Column({ nullable: true })
  formaPago: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) 
  total: number;

  @OneToMany(() => LineaPedido, linea => linea.pedido, {
    cascade: true,
    onDelete: "CASCADE",
  })
  lineas: LineaPedido[];
}
