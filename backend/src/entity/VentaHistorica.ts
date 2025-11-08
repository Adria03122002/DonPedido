import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('VentaHistorica')
export class VentaHistorica {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ubicacion: string; // Ej: "Mesa 3" o "Recoger: Paco"

    @Column({ type: 'json' }) // Almacenamos las líneas de producto como JSON (Texto)
    lineasProducto: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @CreateDateColumn()
    fecha: Date;
}