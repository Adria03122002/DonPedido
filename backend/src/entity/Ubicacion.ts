import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Ubicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string; // 'mesa', 'barra', 'recogida', etc.

  @Column({ nullable: true })
  numero: number;

  @Column()
  estado: string; // 'libre', 'ocupada', etc.
}

