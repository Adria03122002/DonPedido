"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoController = void 0;
const data_source_1 = require("../data-source");
const Producto_1 = require("../entity/Producto");
const ProductoIngrediente_1 = require("../entity/ProductoIngrediente");
const Ingrediente_1 = require("../entity/Ingrediente");
class ProductoController {
    constructor() {
        this.productoRepo = data_source_1.AppDataSource.getRepository(Producto_1.Producto);
    }
    /**
     * Obtener catálogo completo con ingredientes
     */
    async all(req, res) {
        try {
            return await this.productoRepo.find({
                relations: ["ingredientes", "ingredientes.ingrediente"]
            });
        }
        catch (error) {
            res.status(500);
            return { error: "Fallo al obtener productos", detalle: error.message };
        }
    }
    /**
     * Obtener un producto por ID
     */
    async one(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ error: "ID inválido" });
        try {
            const producto = await this.productoRepo.findOne({
                where: { id },
                relations: ["ingredientes", "ingredientes.ingrediente"]
            });
            return producto || res.status(404).json({ error: "No encontrado" });
        }
        catch (error) {
            res.status(500);
            return { error: "Error de servidor", detalle: error.message };
        }
    }
    async save(req, res) {
        const { nombre, tipo, precio, imagenUrl, disponible, stock, ingredientes } = req.body;
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            try {
                let hayIngredienteAgotado = false;
                const ingredientesValidados = [];
                if (ingredientes && Array.isArray(ingredientes)) {
                    for (const item of ingredientes) {
                        const idIng = Number(item.ingredienteId || item.id || item.ingrediente?.id);
                        const ingDB = await manager.findOneBy(Ingrediente_1.Ingrediente, { id: idIng });
                        if (ingDB) {
                            if (!ingDB.disponible)
                                hayIngredienteAgotado = true;
                            ingredientesValidados.push({ db: ingDB, cantidad: Number(item.cantidadNecesaria || 1) });
                        }
                    }
                }
                const disponibilidadFinal = hayIngredienteAgotado ? false : (disponible !== undefined ? disponible : true);
                const nuevo = manager.create(Producto_1.Producto, {
                    nombre,
                    tipo,
                    precio: Number(precio),
                    imagenUrl: imagenUrl || "",
                    disponible: disponibilidadFinal,
                    stock: stock !== undefined ? Number(stock) : null
                });
                const guardado = await manager.save(nuevo);
                for (const item of ingredientesValidados) {
                    const rel = manager.create(ProductoIngrediente_1.ProductoIngrediente, {
                        producto: guardado,
                        ingrediente: item.db,
                        cantidadNecesaria: item.cantidad
                    });
                    await manager.save(rel);
                }
                return {
                    success: true,
                    message: hayIngredienteAgotado ? "Producto creado como NO DISPONIBLE por falta de ingredientes" : "Producto creado correctamente",
                    id: guardado.id
                };
            }
            catch (err) {
                console.error("Error al crear producto:", err);
                res.status(500);
                return { error: "Fallo en creación", detalle: err.message };
            }
        });
    }
    async update(req, res) {
        const id = Number(req.params.id);
        const { nombre, tipo, precio, imagenUrl, disponible, stock, ingredientes } = req.body;
        if (isNaN(id))
            return res.status(400).json({ error: "ID de producto inválido" });
        return await data_source_1.AppDataSource.transaction(async (manager) => {
            try {
                let producto = await manager.findOneBy(Producto_1.Producto, { id });
                if (!producto) {
                    res.status(404);
                    return { error: "El producto no existe" };
                }
                await manager.delete(ProductoIngrediente_1.ProductoIngrediente, { producto: { id } });
                let hayIngredienteAgotado = false;
                if (ingredientes && Array.isArray(ingredientes)) {
                    for (const item of ingredientes) {
                        const idIng = Number(item.ingredienteId || item.id || item.ingrediente?.id);
                        const ingDB = await manager.findOneBy(Ingrediente_1.Ingrediente, { id: idIng });
                        if (ingDB) {
                            if (!ingDB.disponible)
                                hayIngredienteAgotado = true;
                            const rel = manager.create(ProductoIngrediente_1.ProductoIngrediente, {
                                producto: producto,
                                ingrediente: ingDB,
                                cantidadNecesaria: Number(item.cantidadNecesaria || 1)
                            });
                            await manager.save(rel);
                        }
                    }
                }
                producto.nombre = nombre || producto.nombre;
                producto.tipo = tipo || producto.tipo;
                producto.precio = precio !== undefined ? Number(precio) : producto.precio;
                producto.imagenUrl = imagenUrl !== undefined ? imagenUrl : producto.imagenUrl;
                producto.stock = stock !== undefined ? Number(stock) : producto.stock;
                if (hayIngredienteAgotado) {
                    producto.disponible = false;
                    console.log(`⚠️ Forzando NO DISPONIBLE en producto ${producto.nombre} por receta incompleta.`);
                }
                else {
                    producto.disponible = disponible !== undefined ? disponible : producto.disponible;
                }
                await manager.save(producto);
                return {
                    success: true,
                    message: "Producto actualizado",
                    id: producto.id,
                    advertencia: hayIngredienteAgotado ? "Se forzó 'No disponible' por falta de ingredientes" : null
                };
            }
            catch (err) {
                console.error("🔥 Error en actualización:", err.message);
                res.status(500);
                return { error: "Fallo en actualización", detalle: err.message };
            }
        });
    }
    /**
     * Eliminar producto (incluye borrado de receta)
     */
    async delete(req, res) {
        const id = Number(req.params.id);
        try {
            // Borrado manual de la tabla intermedia por seguridad
            await data_source_1.AppDataSource.getRepository(ProductoIngrediente_1.ProductoIngrediente).delete({ producto: { id } });
            const result = await this.productoRepo.delete(id);
            return result.affected !== 0 ? { success: true } : res.status(404).json({ error: "No existe" });
        }
        catch (error) {
            res.status(500);
            return { error: "Error al eliminar", detalle: error.message };
        }
    }
    /**
     * Alternar disponibilidad rápida
     */
    async toggleStatus(req, res) {
        const id = Number(req.params.id);
        try {
            const producto = await this.productoRepo.findOneBy({ id });
            if (!producto)
                return res.status(404).json({ error: "No encontrado" });
            producto.disponible = !producto.disponible;
            return await this.productoRepo.save(producto);
        }
        catch (error) {
            res.status(500);
            return { error: "No se pudo cambiar el estado" };
        }
    }
}
exports.ProductoController = ProductoController;
//# sourceMappingURL=ProductoController.js.map