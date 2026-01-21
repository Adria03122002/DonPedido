import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";

@Entity()
export class Rol {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string; // Ej: "Administrador", "Camarero", "Cocinero"

   
    @OneToMany(() => Usuario, (usuario) => usuario.rol)
    usuarios: Usuario[];
}