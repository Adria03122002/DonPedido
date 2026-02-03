"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoIngredienteController = void 0;
const data_source_1 = require("../data-source");
const ProductoIngrediente_1 = require("../entity/ProductoIngrediente");
const Producto_1 = require("../entity/Producto");
const Ingrediente_1 = require("../entity/Ingrediente");
class ProductoIngredienteController {
    constructor() {
        this.repo = data_source_1.AppDataSource.getRepository(ProductoIngrediente_1.ProductoIngrediente);
        this.productoRepo = data_source_1.AppDataSource.getRepository(Producto_1.Producto);
        this.ingredienteRepo = data_source_1.AppDataSource.getRepository(Ingrediente_1.Ingrediente);
    }
    // Obtener todas las relaciones
    async all(req, res) {
        return this.repo.find({ relations: ["producto", "ingrediente"] });
    }
    async save(req, res) {
        const { productoId, ingredienteId, producto, ingrediente, cantidadNecesaria } = req.body;
        const pId = productoId || (producto && (typeof producto === 'object' ? producto.id : producto));
        const iId = ingredienteId || (ingrediente && (typeof ingrediente === 'object' ? ingrediente.id : ingrediente));
        try {
            if (!pId || !iId) {
                res.status(400);
                return {
                    message: "Faltan IDs de producto o ingrediente",
                    debug: { recibidoProducto: pId, recibidoIngrediente: iId }
                };
            }
            const pDB = await this.productoRepo.findOneBy({ id: Number(pId) });
            const iDB = await this.ingredienteRepo.findOneBy({ id: Number(iId) });
            if (!pDB) {
                res.status(404);
                return { message: `Producto ID ${pId} no encontrado` };
            }
            if (!iDB) {
                res.status(404);
                return { message: `Ingrediente ID ${iId} no encontrado` };
            }
            let relacion = await this.repo.findOne({
                where: {
                    producto: { id: pDB.id },
                    ingrediente: { id: iDB.id }
                }
            });
            if (relacion) {
                relacion.cantidadNecesaria = Number(cantidadNecesaria || 1);
            }
            else {
                relacion = this.repo.create({
                    producto: pDB,
                    ingrediente: iDB,
                    cantidadNecesaria: Number(cantidadNecesaria || 1)
                });
            }
            const resultado = await this.repo.save(relacion);
            return resultado;
        }
        catch (error) {
            console.error("Error crítico en ProductoIngrediente save:", error.message);
            res.status(500);
            return { message: "Error al crear la relación de receta", detalle: error.message };
        }
    }
    /**
     * Ver la receta de un producto específico
     */
    async getByProducto(req, res) {
        const productoId = Number(req.params.id || req.params.productoId);
        if (isNaN(productoId)) {
            res.status(400);
            return { message: "ID de producto inválido" };
        }
        try {
            return await this.repo.find({
                where: { producto: { id: productoId } },
                relations: ["ingrediente"]
            });
        }
        catch (error) {
            res.status(500);
            return { message: "Error al obtener la receta" };
        }
    }
    /**
     * Quitar un ingrediente de una receta
     */
    async delete(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400);
            return { message: "ID de relación inválido" };
        }
        try {
            const relacion = await this.repo.findOneBy({ id });
            if (!relacion) {
                res.status(404);
                return { message: "Relación no encontrada" };
            }
            await this.repo.remove(relacion);
            return { message: "Ingrediente quitado de la receta" };
        }
        catch (error) {
            res.status(500);
            return { message: "Error al eliminar la relación" };
        }
    }
}
exports.ProductoIngredienteController = ProductoIngredienteController;
//# sourceMappingURL=ProductoIngredienteController.js.map