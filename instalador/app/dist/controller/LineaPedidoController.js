"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineaPedidoController = void 0;
const data_source_1 = require("../data-source");
const LineaPedido_1 = require("../entity/LineaPedido");
const Pedido_1 = require("../entity/Pedido");
const Producto_1 = require("../entity/Producto");
class LineaPedidoController {
    constructor() {
        this.repo = data_source_1.AppDataSource.getRepository(LineaPedido_1.LineaPedido);
        this.pedidoRepo = data_source_1.AppDataSource.getRepository(Pedido_1.Pedido);
        this.productoRepo = data_source_1.AppDataSource.getRepository(Producto_1.Producto);
    }
    // Obtener todas las líneas (histórico de consumo detallado)
    async all(req, res) {
        try {
            return await this.repo.find({
                relations: ["producto", "pedido"]
            });
        }
        catch (error) {
            res.status(500);
            return { message: "Error al obtener las líneas de pedido" };
        }
    }
    /**
     * Guardar una nueva línea en un pedido existente
     */
    async save(req, res) {
        const { pedidoId, productoId, cantidad, modificacion } = req.body;
        try {
            const pedido = await this.pedidoRepo.findOne({
                where: { id: Number(pedidoId) },
                relations: ["lineas", "lineas.producto"]
            });
            const producto = await this.productoRepo.findOneBy({ id: Number(productoId) });
            if (!pedido) {
                res.status(404);
                return { message: "Error: El pedido no existe." };
            }
            if (!producto) {
                res.status(404);
                return { message: "Error: El producto no existe." };
            }
            const nuevaLinea = new LineaPedido_1.LineaPedido();
            nuevaLinea.cantidad = Number(cantidad) || 1;
            nuevaLinea.modificacion = String(modificacion || "");
            nuevaLinea.pedido = pedido;
            nuevaLinea.producto = producto;
            await this.repo.save(nuevaLinea);
            const lineasActualizadas = await this.repo.find({
                where: { pedido: { id: pedido.id } },
                relations: ["producto"]
            });
            let nuevoTotal = 0;
            lineasActualizadas.forEach(linea => {
                const precio = Number(linea.producto.precio) || 0;
                nuevoTotal += precio * linea.cantidad;
            });
            pedido.total = nuevoTotal;
            await this.pedidoRepo.save(pedido);
            return {
                message: "Línea añadida y total del pedido actualizado",
                linea: nuevaLinea,
                nuevoTotalPedido: nuevoTotal
            };
        }
        catch (error) {
            console.error("Error al guardar LineaPedido:", error);
            res.status(500);
            return { message: "Error interno del servidor", error: error.message };
        }
    }
    async update(req, res) {
        const { id } = req.params;
        const { cantidad, modificacion } = req.body;
        try {
            const linea = await this.repo.findOneBy({ id: Number(id) });
            if (!linea) {
                res.status(404);
                return { message: "Línea no encontrada" };
            }
            linea.cantidad = Number(cantidad);
            linea.modificacion = String(modificacion || "");
            return await this.repo.save(linea);
        }
        catch (error) {
            res.status(500);
            return { message: "Error al actualizar la línea" };
        }
    }
    async delete(req, res) {
        const { id } = req.params;
        try {
            const linea = await this.repo.findOneBy({ id: Number(id) });
            if (!linea) {
                res.status(404);
                return { message: "Línea no encontrada" };
            }
            await this.repo.remove(linea);
            return { message: "Línea eliminada correctamente" };
        }
        catch (error) {
            res.status(500);
            return { message: "Error al eliminar la línea" };
        }
    }
    // Obtener todas las líneas de un pedido específico
    async findByPedido(req, res) {
        const { pedidoId } = req.params;
        try {
            const lineas = await this.repo.find({
                where: { pedido: { id: Number(pedidoId) } },
                relations: ["producto"]
            });
            return lineas;
        }
        catch (error) {
            res.status(500);
            return { message: "Error al obtener las líneas del pedido" };
        }
    }
}
exports.LineaPedidoController = LineaPedidoController;
//# sourceMappingURL=LineaPedidoController.js.map