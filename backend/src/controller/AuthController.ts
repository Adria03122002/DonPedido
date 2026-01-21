import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entity/Usuario";
import { Rol } from "../entity/Rol";

export class AuthController {
    private usuarioRepo = AppDataSource.getRepository(Usuario);
    private rolRepo = AppDataSource.getRepository(Rol);

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Usuario y contraseña requeridos." });
        }

        try {
            const usuario = await this.usuarioRepo.findOne({ 
                where: { email },
                relations: ["rol"] 
            });

            if (!usuario || !usuario.checkPassword(password)) {
                return res.status(401).json({ message: "Credenciales incorrectas." });
            }

            return res.json({
                message: "Login exitoso",
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol.nombre 
                }
            });

        } catch (error) {
            console.error("Error en login:", error);
            return res.status(500).json({ message: "Error interno en el servidor." });
        }
    }

    async save(req: Request, res: Response) {
        const { nombre, email, password, idRol } = req.body;

        if (!nombre || !email || !password || !idRol) {
            return res.status(400).json({ message: "Faltan datos obligatorios (nombre, email, password, idRol)." });
        }

        try {
            const existe = await this.usuarioRepo.findOneBy({ email });
            if (existe) {
                return res.status(409).json({ message: "El email ya está registrado." });
            }

            const rol = await this.rolRepo.findOneBy({ id: idRol });
            if (!rol) {
                return res.status(404).json({ message: "El Rol especificado no existe." });
            }

            const usuario = new Usuario();
            usuario.nombre = nombre;
            usuario.email = email;
            usuario.passwordHash = password; 
            usuario.rol = rol;

            await this.usuarioRepo.save(usuario);

            return res.status(201).json({ message: "Usuario registrado correctamente." });

        } catch (error) {
            console.error("Error al registrar usuario:", error);
            return res.status(500).json({ message: "Error interno al guardar usuario." });
        }
    }

}