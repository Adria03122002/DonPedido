import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Ingrediente')
export class Ingrediente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'decimal', default: 0 })
  stock: number;

  @Column({ default: 'unidad' }) // kg, g, ml, litros...
  unidad: string;

  @Column({ default: true })
  disponible: boolean;

  @Column({ nullable: true })
  tipo: string;


}
