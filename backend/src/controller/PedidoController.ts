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
                    // Solo traemos pedidos que NO estén servidos ni finalizados
                    estado: Not(In(["servido", "finalizado"]))
                },
                relations: ["lineas", "lineas.producto"],
                order: { fecha: "ASC" } // Los más antiguos primero (prioridad)
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
        const { ubicacion, lineas, estado } = req.body;

        console.log(`\n--- [DEBUG] 1: INICIO UPDATE PEDIDO ${id} ---`);

        if (isNaN(id)) {
            console.error("❌ [DEBUG] ERROR: ID es NaN");
            res.status(400);
            return { error: "ID no válido" };
        }

        try {
            // 1. Cargar el pedido con sus líneas para tenerlo en memoria
            const pedido = await this.pedidoRepo.findOne({
                where: { id },
                relations: ["lineas"]
            });

            if (!pedido) {
                console.error("❌ [DEBUG] Pedido no encontrado");
                res.status(404);
                return { error: "No existe" };
            }

            // 2. BORRADO "FUERZA BRUTA" (Query Builder)
            // Esto envía un "DELETE FROM lineapedido WHERE pedidoId = X" directo a MySQL
            console.log(`🧹 [DEBUG] 2: Ejecutando borrado SQL de líneas antiguas...`);
            await AppDataSource
                .createQueryBuilder()
                .delete()
                .from(LineaPedido)
                .where("pedidoId = :id", { id: pedido.id })
                .execute();

            // Vaciamos la relación en el objeto de memoria para que el save posterior no haga cosas raras
            pedido.lineas = [];
            console.log("✅ [DEBUG] 3: Memoria del objeto limpiada.");

            // 3. INSERTAR NUEVAS LÍNEAS
            let nuevoTotal = 0;
            if (lineas && Array.isArray(lineas)) {
                console.log(`🏗️ [DEBUG] 4: Procesando ${lineas.length} líneas nuevas...`);
                for (const item of lineas) {
                    const idProd = Number(item.productoId || item.producto?.id);
                    const producto = await this.productoRepo.findOneBy({ id: idProd });

                    if (producto) {
                        const cant = Number(item.cantidad) || 1;
                        nuevoTotal += Number(producto.precio) * cant;

                        // Creamos la línea pero NO la guardamos aún individualmente
                        const nuevaLinea = this.lineaRepo.create({
                            cantidad: cant,
                            modificacion: item.modificacion || "",
                            pedido: pedido,
                            producto: producto
                        });
                        // La añadimos al array del pedido
                        pedido.lineas.push(nuevaLinea);
                    }
                }
            }

            // 4. ACTUALIZAR CABECERA Y GUARDAR TODO EN CASCADA
            pedido.total = nuevoTotal;
            pedido.ubicacion = ubicacion || pedido.ubicacion;
            if (estado) pedido.estado = estado;

            console.log("💾 [DEBUG] 5: Guardando pedido y nuevas líneas en una sola operación...");
            await this.pedidoRepo.save(pedido);

            // 5. RECARGA FINAL (Garantiza que 'producto' no sea null)
            const pedidoFinal = await this.pedidoRepo.findOne({
                where: { id: pedido.id },
                relations: ["lineas", "lineas.producto"]
            });

            console.log("🚀 [DEBUG] 6: Sincronización terminada.");
            return this.serializar(pedidoFinal!);

        } catch (error: any) {
            console.error("🔥 [DEBUG] FALLO CRÍTICO:", error.message);
            res.status(500);
            return { error: "Error en el servidor", detalle: error.message };
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
            const pedido = await this.pedidoRepo.findOneBy({ id });
            if (!pedido) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            pedido.estado = estado;
            await this.pedidoRepo.save(pedido);
            
            return res.json({ success: true, estado: pedido.estado });
        } catch (error: any) {
            return res.status(500).json({ error: "Error al actualizar estado", detalle: error.message });
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