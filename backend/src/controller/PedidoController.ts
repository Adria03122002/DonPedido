import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Pedido } from "../entity/Pedido";
import { LineaPedido } from "../entity/LineaPedido"; 
import { Producto } from "../entity/Producto";
import { In, Not, Repository } from "typeorm";

export class PedidoController {
    private pedidoRepo: Repository<Pedido> = AppDataSource.getRepository(Pedido);
    private lineaRepo: Repository<LineaPedido> = AppDataSource.getRepository(LineaPedido);
    private productoRepo: Repository<Producto> = AppDataSource.getRepository(Producto);

    /**
     * Limpia los datos para que el Front no reciba strings donde espera números.
     */
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

    /**
     * OBTENER PEDIDOS PARA COCINA (FILTRADO)
     * Ahora excluye los pedidos con estado 'servido' o 'finalizado'
     */
    async getPedidosActivos(req: Request, res: Response) {
        try {
            const pedidos = await this.pedidoRepo.find({
                where: { 
                    pagado: false,
                    estado: Not(In(["servido", "finalizado"]))
                },
                relations: ["lineas", "lineas.producto"],
                order: { fecha: "ASC" } 
            });
            return pedidos.map(p => this.serializar(p));
        } catch (error) {
            return res.status(500).json({ error: "Error al cargar pedidos de cocina" });
        }
    }

    // action: "one"
    async one(req: Request, res: Response) {
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
            res.status(400);
            return { error: "ID de pedido inválido", recibido: req.params.id };
        }

        const pedido = await this.pedidoRepo.findOne({
            where: { id },
            relations: ["lineas", "lineas.producto"]
        });

        if (!pedido) {
            res.status(404);
            return { message: "Pedido no encontrado" };
        }
        return this.serializar(pedido);
    }

    /**
     * action: "updatePedido"
     * ESTA ES LA FUNCIÓN QUE ARREGLA EL TICKET
     */
    async updatePedido(req: Request, res: Response) {
        const id = Number(req.params.id);
        const { ubicacion, lineas } = req.body;

        if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

        try {
            const pedido = await this.pedidoRepo.findOne({
                where: { id },
                relations: ["lineas", "lineas.producto"]
            });

            if (!pedido) return res.status(404).json({ error: "No existe el pedido" });

            const estabaServido = pedido.estado === "servido";
            
            const datosViejos: { [id: number]: { cant: number, nota: string } } = {};
            pedido.lineas.forEach(l => {
                datosViejos[l.producto.id] = { 
                    cant: l.cantidad, 
                    nota: l.modificacion || "" 
                };
            });

            // 1. Limpieza de líneas para reconstrucción
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(LineaPedido)
                .where("pedidoId = :id", { id: pedido.id })
                .execute();

            pedido.lineas = [];

            // 2. Procesamiento de nuevas líneas y cálculo de total
            let totalReal = 0;
            if (lineas && Array.isArray(lineas)) {
                for (const item of lineas) {
                    const prodId = Number(item.productoId || item.producto?.id);
                    const producto = await this.productoRepo.findOneBy({ id: prodId });

                    if (producto) {
                        const cantNueva = Number(item.cantidad) || 1;
                        const viejo = datosViejos[prodId] || { cant: 0, nota: "" };
                        
                        totalReal += Number(producto.precio) * cantNueva;

                        // Recuperamos la nota (prioridad a la que viene del TPV, si no la vieja)
                        let notaFinal = item.modificacion || viejo.nota;

                        if (estabaServido && viejo.cant > 0) {
                            const marcadorOk = `[OK: ${viejo.cant} SERVIDAS]`;
                            
                            if (cantNueva > viejo.cant) {
                                // LÓGICA DE LIMPIEZA: Quitamos [ENTREGADO] si vamos a poner [OK: X SERVIDAS]
                                // Usamos una RegExp para quitar el tag y los espacios sobrantes
                                notaFinal = notaFinal.replace(/\[ENTREGADO\]\s*/gi, "");
                                
                                if (!notaFinal.includes(marcadorOk)) {
                                    notaFinal = `${marcadorOk} ${notaFinal}`.trim();
                                }
                            } else {
                                // Si no hay incremento, mantenemos el tag de entregado
                                if (!notaFinal.includes("[ENTREGADO]")) {
                                    notaFinal = `[ENTREGADO] ${notaFinal}`.trim();
                                }
                            }
                        }

                        pedido.lineas.push(this.lineaRepo.create({
                            cantidad: cantNueva,
                            modificacion: notaFinal,
                            pedido: pedido,
                            producto: producto
                        }));
                    }
                }
            }

            pedido.total = totalReal;
            pedido.ubicacion = ubicacion || pedido.ubicacion;
            pedido.estado = "pendiente"; 

            await this.pedidoRepo.save(pedido);

            // 3. Respuesta con el objeto refrescado para la tablet
            const pedidoActualizado = await this.pedidoRepo.findOne({
                where: { id: pedido.id },
                relations: ["lineas", "lineas.producto"]
            });

            return res.json(pedidoActualizado);

        } catch (error: any) {
            console.error("Error en update:", error.message);
            return res.status(500).json({ error: "Error interno" });
        }
    }

    // action: "getPedidoActivoPorMesa"
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
                return { message: "Libre" };
            }
            return this.serializar(pedido);
        } catch (error) {
            res.status(500);
            return { message: "Error al buscar mesa" };
        }
    }

    async save(req: Request, res: Response) {
            console.log("\n--- [DEBUG] INICIO SAVE (CREAR NUEVO PEDIDO) ---");
            const { ubicacion, nombreCliente, lineas, estado } = req.body;
            
            console.log("Console.log(1: Datos recibidos en el Body):", JSON.stringify({ ubicacion, nombreCliente, numLineas: lineas?.length }));

            try {
                // 1. Crear la entidad base
                const nuevoPedido = new Pedido();
                // Evitamos usar nombreCliente como columna si da error, lo metemos en ubicacion si es necesario
                nuevoPedido.ubicacion = String(ubicacion || nombreCliente || "Barra");
                nuevoPedido.estado = estado || "pendiente";
                nuevoPedido.pagado = false;
                nuevoPedido.total = 0;

                console.log("Console.log(2: Intentando guardar cabecera inicial...)");
                const pedidoGuardado = await this.pedidoRepo.save(nuevoPedido);
                console.log(`✅ Console.log(3: Pedido creado con ID: ${pedidoGuardado.id})`);

                let totalAcumulado = 0;

                // 2. Procesar líneas
                if (lineas && Array.isArray(lineas)) {
                    console.log("Console.log(4: Empezando a procesar líneas de productos...)");
                    for (const [idx, item] of lineas.entries()) {
                        const idProd = Number(item.productoId || item.producto?.id);
                        
                        if (isNaN(idProd)) {
                            console.log(`⚠️ Console.log(Línea ${idx} ignorada: ID de producto no es número)`);
                            continue;
                        }

                        const producto = await this.productoRepo.findOneBy({ id: idProd });
                        
                        if (producto) {
                            const cantidad = Number(item.cantidad) || 1;
                            totalAcumulado += Number(producto.precio) * cantidad;

                            const nuevaLinea = this.lineaRepo.create({
                                cantidad: cantidad,
                                modificacion: String(item.modificacion || ""),
                                pedido: pedidoGuardado,
                                producto: producto
                            });
                            await this.lineaRepo.save(nuevaLinea);
                            console.log(`   ➕ Console.log(Línea ${idx} guardada: ${producto.nombre} x${cantidad})`);
                        } else {
                            console.log(`❌ Console.log(Línea ${idx} ERROR: Producto ${idProd} no existe)`);
                        }
                    }
                }

                // 3. Actualizar total final
                pedidoGuardado.total = totalAcumulado;
                console.log(`Console.log(5: Guardando total final calculado: ${totalAcumulado})`);
                await this.pedidoRepo.save(pedidoGuardado);

                console.log("🚀 Console.log(FIN: Pedido creado y sincronizado con éxito)");
                console.log("---------------------------------------------------\n");

                // Devolvemos el pedido completo con sus relaciones
                const resultadoFinal = await this.pedidoRepo.findOne({
                    where: { id: pedidoGuardado.id },
                    relations: ["lineas", "lineas.producto"]
                });

                return this.serializar(resultadoFinal!);

            } catch (error: any) {
                console.error("🔥 Console.log(ERROR CRÍTICO EN SAVE):", error.message);
                res.status(500);
                return { error: "Error al crear pedido", detalle: error.message };
            }
    }

    // action: "actualizarEstado"
    async actualizarEstado(req: Request, res: Response) {
        const id = Number(req.params.id);
        const { estado } = req.body;

        try {
            const pedido = await this.pedidoRepo.findOne({
                where: { id },
                relations: ["lineas", "lineas.producto"]
            });

            if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

            pedido.estado = estado;

            if (estado.toLowerCase() === "servido" && pedido.lineas) {
                pedido.lineas.forEach(linea => {
                    let notaActual = linea.modificacion || "";
                    
                    // Al completar el pedido, limpiamos cualquier marcador parcial previo [OK: ...]
                    // para poner el tag definitivo de [ENTREGADO]
                    notaActual = notaActual.replace(/\[OK:.*SERVIDAS\]\s*/gi, "");

                    if (!notaActual.includes("[ENTREGADO]")) {
                        linea.modificacion = `[ENTREGADO] ${notaActual}`.trim();
                    }
                });
                await this.lineaRepo.save(pedido.lineas);
            }

            await this.pedidoRepo.save(pedido);
            
            const final = await this.pedidoRepo.findOne({
                where: { id },
                relations: ["lineas", "lineas.producto"]
            });

            return res.json(final);
        } catch (error: any) {
            console.error("Error al actualizar estado:", error.message);
            return res.status(500).json({ error: "Error al actualizar estado" });
        }
    }

    async marcarComoPagado(req: Request, res: Response) {
        const id = Number(req.params.id);
        const { formaPago } = req.body;

        try {
            const pedido = await this.pedidoRepo.findOneBy({ id });
            if (!pedido) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            pedido.pagado = true;
            pedido.estado = 'finalizado';
            // Aquí podrías guardar la forma de pago si tuvieras la columna:
            // pedido.formaPago = formaPago; 

            await this.pedidoRepo.save(pedido);
            return res.json({ success: true, message: "Pedido cobrado" });
        } catch (error: any) {
            return res.status(500).json({ error: "Error al procesar pago" });
        }
    }

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        await this.pedidoRepo.delete(id);
        return { message: "Borrado" };
    }

    async all(req: Request, res: Response) {
        const pedidos = await this.pedidoRepo.find({ relations: ["lineas", "lineas.producto"], order: { fecha: "DESC" } });
        return pedidos.map(p => this.serializar(p));
    }

    /**
     * MAPA DE MESAS (Para la vista de barra)
     */
    async getMapaMesas(req: Request, res: Response) {
        try {
            const pedidosActivos = await this.pedidoRepo.find({
                where: { pagado: false }
            });

            const mapa = Array.from({ length: 12 }, (_, i) => {
                const num = i + 1;
                const pedido = pedidosActivos.find(p => p.ubicacion === `Mesa ${num}`);
                return {
                    numero: num,
                    ocupada: !!pedido,
                    pedidoId: pedido ? pedido.id : null,
                    estado: pedido ? pedido.estado : 'libre',
                    total: pedido ? Number(pedido.total) : 0
                };
            });
            return res.json(mapa);
        } catch (error) {
            return res.status(500).json({ message: "Error en mapa de mesas" });
        }
    }
}