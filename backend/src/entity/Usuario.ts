import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, BeforeUpdate } from "typeorm";
import { Rol } from "./Rol";
import * as bcrypt from "bcryptjs";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string; 

    @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
    rol: Rol;

    @BeforeInsert()
    @BeforeUpdate()
    hashPassword() {
        if (this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
            const salt = bcrypt.genSaltSync(10);
            this.passwordHash = bcrypt.hashSync(this.passwordHash, salt);
        }
    }

    checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.passwordHash);
    }
}