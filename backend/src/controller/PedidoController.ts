import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Pedido } from "../entity/Pedido";
import { Repository } from "typeorm";
import { LineaPedido } from "../entity/LineaPedido"; 
import { Producto } from "../entity/Producto";

export class PedidoController {
    private pedidoRepo: Repository<Pedido> = AppDataSource.getRepository(Pedido);
    private lineaRepo: Repository<LineaPedido> = AppDataSource.getRepository(LineaPedido);
    private productoRepo: Repository<Producto> = AppDataSource.getRepository(Producto);

    private serializar(pedido: Pedido) {
        return {
            ...pedido,
            total: Number(pedido.total || 0),
            lineas: pedido.lineas ? pedido.lineas.map(l => ({
                ...l,
                cantidad: Number(l.cantidad || 0),
                producto: l.producto ? { 
                    ...l.producto, 
                    precio: Number(l.producto.precio || 0) 
                } : null
            })) : []
        };
    }

    // Obtener todos los pedidos con sus líneas
    async all(req: Request, res: Response) { 
        return this.pedidoRepo.find({ 
            relations: ["lineas", "lineas.producto"],
            order: { fecha: "DESC" }
        }); 
    }

    // Obtener solo los que no están pagados
    async getPedidosActivos(req: Request, res: Response) {
        try {
            const pedidos = await this.pedidoRepo.find({
                where: { pagado: false },
                relations: ["lineas", "lineas.producto"],
                order: { fecha: "ASC" }
            });
            
            // Devolvemos la lista (aunque sea []) con un 200 OK
            return res.status(200).json(pedidos.map(p => this.serializar(p)));
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener la lista de pedidos" });
        }
    }
    
    /**
     * CREAR PEDIDO (POST /bar_app/pedidos)
     */
    async save(req: Request, res: Response) {
        const { ubicacion, nombreCliente, lineas } = req.body;
        try {
            const nuevoPedido = new Pedido();
            nuevoPedido.ubicacion = String(ubicacion || nombreCliente || "Barra");
            if ('nombreCliente' in nuevoPedido) {
                (nuevoPedido as any).nombreCliente = String(nombreCliente || "");
            }

            nuevoPedido.estado = "pendiente";
            nuevoPedido.pagado = false;
            nuevoPedido.total = 0;

            const pedidoGuardado = await this.pedidoRepo.save(nuevoPedido);
            let totalAcumulado = 0;

            if (lineas && Array.isArray(lineas)) {
                for (const item of lineas) {
                    const idProd = item.productoId || (item.producto && item.producto.id);
                    const producto = await this.productoRepo.findOneBy({ id: Number(idProd) });
                    
                    if (producto) {
                        const cantidad = Number(item.cantidad) || 1;
                        totalAcumulado += Number(producto.precio) * cantidad;

                        const nuevaLinea = new LineaPedido();
                        nuevaLinea.cantidad = cantidad;
                        nuevaLinea.modificacion = String(item.modificacion || "");
                        nuevaLinea.pedido = pedidoGuardado;
                        nuevaLinea.producto = producto;
                        await this.lineaRepo.save(nuevaLinea);
                    }
                }
                pedidoGuardado.total = totalAcumulado;
                await this.pedidoRepo.save(pedidoGuardado);
            }

            return await this.pedidoRepo.findOne({
                where: { id: pedidoGuardado.id },
                relations: ["lineas", "lineas.producto"]
            });
        } catch (error: any) {
            console.error("Error al crear pedido:", error);
            res.status(500);
            return { message: "Error al procesar pedido", details: error.message };
        }
    }

    /**
     * ACTUALIZAR PEDIDO (PUT /bar_app/pedidos/:id)
     */
    async updatePedido(req: Request, res: Response) {
        const { id } = req.params;
        const { lineas, estado } = req.body;

        try {
            const pedido = await this.pedidoRepo.findOne({
                where: { id: Number(id) },
                relations: ["lineas"]
            });

            if (!pedido) {
                res.status(404);
                return { message: "Pedido no encontrado" };
            }

            // Actualizamos estado si viene en el body
            if (estado) pedido.estado = estado;

            let totalExtra = 0;
            if (lineas && Array.isArray(lineas)) {
                for (const item of lineas) {
                    const idProd = item.productoId || (item.producto && item.producto.id);
                    const producto = await this.productoRepo.findOneBy({ id: Number(idProd) });
                    
                    if (producto) {
                        const cantidad = Number(item.cantidad) || 1;
                        totalExtra += Number(producto.precio) * cantidad;

                        const nuevaLinea = new LineaPedido();
                        nuevaLinea.cantidad = cantidad;
                        nuevaLinea.modificacion = String(item.modificacion || "");
                        nuevaLinea.pedido = pedido; 
                        nuevaLinea.producto = producto;
                        await this.lineaRepo.save(nuevaLinea);
                    }
                }
            }

            // Sumamos al total existente
            pedido.total = Number(pedido.total) + totalExtra;
            await this.pedidoRepo.save(pedido);

            return await this.pedidoRepo.findOne({
                where: { id: pedido.id },
                relations: ["lineas", "lineas.producto"]
            });

        } catch (error: any) {
            console.error("Error en updatePedido:", error);
            res.status(500);
            return { message: "Error al actualizar", details: error.message };
        }
    }

    async marcarComoPagado(req: Request, res: Response) {
        const { id } = req.params as any;
        const { formaPago } = req.body;
        try {
            const pedido = await this.pedidoRepo.findOneBy({ id: Number(id) });
            if (!pedido) {
                res.status(404);
                return { message: "Pedido no encontrado" };
            }
            pedido.pagado = true;
            pedido.estado = "finalizado";
            pedido.formaPago = formaPago || "EFECTIVO";
            return await this.pedidoRepo.save(pedido);
        } catch (error) {
            res.status(500);
            return { message: "Error al procesar pago" };
        }
    }

    async updateEstado(req: Request, res: Response) {
        const { id } = req.params as any;
        const { estado } = req.body;
        try {
            const pedido = await this.pedidoRepo.findOneBy({ id: Number(id) });
            if (!pedido) {
                res.status(404);
                return { message: "Pedido no encontrado" };
            }
            pedido.estado = String(estado);
            return await this.pedidoRepo.save(pedido);
        } catch (error) {
            res.status(500);
            return { message: "Error al actualizar estado" };
        }
    }

    async getPedidoActivoPorMesa(req: Request, res: Response) {
        const { ubicacionString } = req.params;
        try {
            const pedido = await this.pedidoRepo.findOne({
                where: [
                    { ubicacion: ubicacionString, pagado: false },
                    { ubicacion: `Mesa ${ubicacionString}`, pagado: false }
                ],
                relations: ["lineas", "lineas.producto"]
            });

            if (!pedido) {
                res.status(404);
                return { message: "Mesa libre" };
            }
            return pedido;
        } catch (error) {
            res.status(500);
            return { message: "Error al buscar mesa" };
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await this.pedidoRepo.delete(Number(id));
            return { message: "Pedido eliminado correctamente" };
        } catch (error) {
            res.status(500);
            return { message: "Error al eliminar pedido" };
        }
    }
}