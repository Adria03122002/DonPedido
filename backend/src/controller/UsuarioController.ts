import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { Usuario } from "../entity/Usuario";
import { Rol } from "../entity/Rol";

export class UsuarioController {
    private userRepo = AppDataSource.getRepository(Usuario);
    private rolRepo = AppDataSource.getRepository(Rol);

    // Obtener todos los usuarios
    async all(req: Request, res: Response) {
        try {
            const usuarios = await this.userRepo.find({
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                },
                relations: ["rol"]
            });

            return res.json(usuarios);
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener usuarios" });
        }
    }

    // Obtener un usuario por ID
    async one(req: Request, res: Response) {
        const { id } = req.params as any;
        return this.userRepo.findOne({
            where: { id: Number(id) },
            relations: ["rol"]
        });
    }

    // Guardar o actualizar un usuario
    async save(req: Request, res: Response) {
        const { nombre, email, password, idRol } = req.body;

        try {
            // Buscamos el objeto Rol (por defecto 2 si no viene especificado)
            const rol = await this.rolRepo.findOneBy({ id: idRol || 2 }); 
            
            if (!rol) {
                res.status(404);
                return { message: "Rol no encontrado" };
            }

            const nuevoUsuario = new Usuario();
            nuevoUsuario.nombre = nombre;
            nuevoUsuario.email = email;
            // La contraseña se envía en texto plano; la entidad Usuario la encriptará
            nuevoUsuario.passwordHash = password; 
            nuevoUsuario.rol = rol;

            return await this.userRepo.save(nuevoUsuario);
        } catch (error: any) {
            res.status(500);
            return { message: "Error al guardar el usuario", error: error.message };
        }
    }

    // Eliminar un usuario
    async remove(req: Request, res: Response) {
        const { id } = req.params as any;
        try {
            const userToRemove = await this.userRepo.findOneBy({ id: Number(id) });
            
            if (!userToRemove) {
                res.status(404);
                return { message: "No se pudo encontrar al usuario para eliminar." };
            }
            
            await this.userRepo.remove(userToRemove);
            return { message: "Usuario eliminado correctamente" };
        } catch (error) {
            res.status(500);
            return { message: "Error al intentar eliminar el usuario" };
        }
    }
}