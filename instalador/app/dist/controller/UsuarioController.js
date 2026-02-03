"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const data_source_1 = require("../data-source");
const Usuario_1 = require("../entity/Usuario");
const Rol_1 = require("../entity/Rol");
class UsuarioController {
    constructor() {
        this.userRepo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
        this.rolRepo = data_source_1.AppDataSource.getRepository(Rol_1.Rol);
    }
    // Obtener todos los usuarios
    async all(req, res) {
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
        }
        catch (error) {
            return res.status(500).json({ message: "Error al obtener usuarios" });
        }
    }
    async update(req, res) {
        const id = parseInt(req.params.id);
        const { nombre, email, password, rol } = req.body;
        try {
            const usuario = await this.userRepo.findOne({
                where: { id },
                relations: ["rol"]
            });
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            usuario.nombre = nombre;
            usuario.email = email;
            if (password && password.trim() !== "") {
                usuario.passwordHash = password;
            }
            if (rol && rol.id) {
                const nuevoRol = await this.rolRepo.findOne({ where: { id: rol.id } });
                if (nuevoRol) {
                    usuario.rol = nuevoRol;
                }
            }
            const resultado = await this.userRepo.save(usuario);
            delete resultado.passwordHash;
            return resultado;
        }
        catch (error) {
            console.error("Error al actualizar usuario:", error);
            return res.status(500).json({ message: "Error interno al actualizar" });
        }
    }
    async save(req, res) {
        const { nombre, email, password, idRol } = req.body;
        try {
            const rol = await this.rolRepo.findOneBy({ id: idRol || 2 });
            if (!rol) {
                res.status(404);
                return { message: "Rol no encontrado" };
            }
            const nuevoUsuario = new Usuario_1.Usuario();
            nuevoUsuario.nombre = nombre;
            nuevoUsuario.email = email;
            nuevoUsuario.passwordHash = password;
            nuevoUsuario.rol = rol;
            return await this.userRepo.save(nuevoUsuario);
        }
        catch (error) {
            res.status(500);
            return { message: "Error al guardar el usuario", error: error.message };
        }
    }
    async remove(req, res) {
        const { id } = req.params;
        try {
            const userToRemove = await this.userRepo.findOneBy({ id: Number(id) });
            if (!userToRemove) {
                res.status(404);
                return { message: "No se pudo encontrar al usuario para eliminar." };
            }
            await this.userRepo.remove(userToRemove);
            return { message: "Usuario eliminado correctamente" };
        }
        catch (error) {
            res.status(500);
            return { message: "Error al intentar eliminar el usuario" };
        }
    }
}
exports.UsuarioController = UsuarioController;
//# sourceMappingURL=UsuarioController.js.map