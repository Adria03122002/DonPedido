"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredienteController = void 0;
const data_source_1 = require("../data-source");
const Ingrediente_1 = require("../entity/Ingrediente");
const typeorm_1 = require("typeorm");
const Producto_1 = require("../entity/Producto");
class IngredienteController {
    constructor() {
        this.repo = data_source_1.AppDataSource.getRepository(Ingrediente_1.Ingrediente);
    }
    // Ver stock actual (Lista completa)
    async all(req, res) {
        try {
            return await this.repo.find({
                order: { nombre: "ASC" }
            });
        }
        catch (error) {
            res.status(500);
            return { message: "Error al cargar el inventario" };
        }
    }
    // Obtener un solo ingrediente por ID
    async one(req, res) {
        const { id } = req.params;
        try {
            const item = await this.repo.findOneBy({ id: Number(id) });
            if (!item) {
                res.status(404);
                return { message: "Ingrediente no encontrado" };
            }
            return item;
        }
        catch (error) {
            res.status(500);
            return { message: "Error al buscar el ingrediente" };
        }
    }
    // Actualizar ingrediente
    async update(req, res) {
        const id = parseInt(req.params.id);
        const { nombre, stock, cantidad, disponible, unidad, tipo } = req.body;
        try {
            let ingrediente = await this.repo.findOneBy({ id });
            if (!ingrediente) {
                res.status(404);
                return { message: "Ingrediente no encontrado" };
            }
            ingrediente.nombre = nombre || ingrediente.nombre;
            ingrediente.unidad = unidad || ingrediente.unidad;
            ingrediente.tipo = tipo || ingrediente.tipo;
            if (cantidad !== undefined) {
                ingrediente.cantidad = Number(cantidad);
            }
            else if (stock !== undefined) {
                ingrediente.cantidad = Number(stock);
            }
            if (disponible !== undefined) {
                ingrediente.disponible = (disponible === true || disponible === 'true');
            }
            const resultado = await this.repo.save(ingrediente);
            if (disponible !== undefined) {
                const valorDisponible = (disponible === true || disponible === 'true');
                const productoRepo = data_source_1.AppDataSource.getRepository(Producto_1.Producto);
                const productosAfectados = await productoRepo.find({
                    where: {
                        ingredientes: {
                            ingrediente: { id: id }
                        }
                    }
                });
                if (productosAfectados.length > 0) {
                    for (const prod of productosAfectados) {
                        prod.disponible = valorDisponible;
                        await productoRepo.save(prod);
                    }
                }
            }
            return resultado;
        }
        catch (error) {
            console.error("Error al actualizar ingrediente:", error);
            res.status(500);
            return { message: "Error al actualizar cantidad" };
        }
    }
    // Añadir ingrediente
    async save(req, res) {
        const { nombre, cantidad, unidad, tipo, disponible } = req.body;
        try {
            const item = new Ingrediente_1.Ingrediente();
            item.nombre = String(nombre);
            item.cantidad = Number(cantidad);
            item.unidad = String(unidad || "uds");
            item.disponible = disponible;
            item.tipo = String(tipo || "");
            return await this.repo.save(item);
        }
        catch (error) {
            res.status(500);
            return { message: "Error al procesar el ingrediente", error: error.message };
        }
    }
    // Ajuste rápido de inventario (Entrada de proveedor o merma)
    async updateStock(req, res) {
        const { id } = req.params;
        const { nuevaCantidad } = req.body;
        try {
            const item = await this.repo.findOneBy({ id: Number(id) });
            if (!item) {
                res.status(404);
                return { message: "Ingrediente no encontrado" };
            }
            item.cantidad = Number(nuevaCantidad);
            return await this.repo.save(item);
        }
        catch (error) {
            res.status(500);
            return { message: "Error al actualizar stock" };
        }
    }
    // Eliminar ingrediente del sistema
    async remove(req, res) {
        const { id } = req.params;
        try {
            const item = await this.repo.findOneBy({ id: Number(id) });
            if (!item) {
                res.status(404);
                return { message: "El ingrediente no existe" };
            }
            await this.repo.remove(item);
            return { message: "Ingrediente eliminado del almacén" };
        }
        catch (error) {
            res.status(500);
            return { message: "Error al eliminar el ingrediente" };
        }
    }
    // LÓGICA DE NEGOCIO: Obtener ingredientes con poco stock (menos de 5 unidades)
    async getBajoStock(req, res) {
        try {
            return await this.repo.find({
                where: {
                    cantidad: (0, typeorm_1.LessThan)(5)
                }
            });
        }
        catch (error) {
            res.status(500);
            return { message: "Error al consultar alertas de stock" };
        }
    }
}
exports.IngredienteController = IngredienteController;
//# sourceMappingURL=IngredienteController.js.map