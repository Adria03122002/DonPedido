import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Pedido } from "../entity/Pedido";
import { MoreThanOrEqual, Repository, Not, Raw } from "typeorm";
import { Ubicacion } from "../entity/Ubicacion";
import { LineaPedido } from "../entity/LineaPedido"; 
import { Producto } from "../entity/Producto";

export class PedidoController {
    private pedidoRepo: Repository<Pedido> = AppDataSource.getRepository(Pedido);
    private lineaRepo: Repository<LineaPedido> = AppDataSource.getRepository(LineaPedido);
    private productoRepo: Repository<Producto> = AppDataSource.getRepository(Producto);
    private ubicacionRepo: Repository<Ubicacion> = AppDataSource.getRepository(Ubicacion);

    // --- MÉTODOS CRUD BÁSICOS (Mantenidos) ---
    async all(req: Request, res: Response) { /* ... */ return this.pedidoRepo.find({ relations: ["lineas", "lineas.producto", "ubicacion"] }); }
    async one(req: Request, res: Response) { /* ... */ return this.pedidoRepo.findOne({ where: { id: parseInt(req.params.id) }, relations: ["lineas", "lineas.producto", "ubicacion"] }); }
    async delete(req: Request, res: Response) { /* ... */ return "pedido eliminado correctamente"; }
    async actualizarEstado(req: Request, res: Response) { /* ... */ return { mensaje: `estado del pedido actualizado a '${req.body.estado}'` }; }
    async cerrarCaja(req: Request, res: Response) { /* ... */ return `se han eliminado ${0} pedidos del día`; }
    async marcarComoPagado(req: Request, res: Response) { /* ... */ return { mensaje: `Pedido ${req.params.id} marcado como pagado` }; }

    // --- 1. CREAR PEDIDO (POST) ---
    async save(req: Request, res: Response) {
        const { ubicacion, lineas, estado, fecha, pagado, formaPago, nombreCliente } = req.body;
        console.log('Payload recibido para guardar (POST):', req.body); // DEBUG

        try {
            // 1. Manejar la Ubicación (Búsqueda o Creación Fija)
            const criteriosDeBusqueda: any = { tipo: ubicacion.tipo };
            if (ubicacion.numero !== null) { criteriosDeBusqueda.numero = ubicacion.numero; }
            let ubicacionEntity = await this.ubicacionRepo.findOneBy(criteriosDeBusqueda);

            const tiposFijos = ['recoger', 'barra']; 
            if (!ubicacionEntity && tiposFijos.includes(ubicacion.tipo)) {
                ubicacionEntity = await this.ubicacionRepo.save(this.ubicacionRepo.create({ tipo: ubicacion.tipo, numero: ubicacion.numero, estado: 'libre' }));
            }

            if (!ubicacionEntity) {
                return res.status(400).json({ error: "Ubicación no encontrada. La mesa/ubicación fija no existe en la DB." });
            }

            // 2. Crear la entidad Pedido (Con corrección de TOTAL y formaPago)
            const nuevoPedido = this.pedidoRepo.create({
                estado, fecha: new Date(fecha), pagado,
                formaPago: nombreCliente, // Usamos nombreCliente para Recoger
                total: 0, // Corrección: Total es obligatorio
                ubicacion: { id: ubicacionEntity.id } 
            });
            const pedidoGuardado = await this.pedidoRepo.save(nuevoPedido);

            // 3. Crear y Guardar las Líneas de Pedido
            const lineasParaGuardar = lineas.map(async (linea: any) => {
                const productoId = linea?.producto?.id; 
                if (!productoId || typeof productoId !== 'number') { throw new Error(`ID de producto inválido en la línea de pedido.`); }
                const producto = await this.productoRepo.findOneBy({ id: productoId });
                if (!producto) { throw new Error(`Producto con ID ${productoId} no encontrado.`); }

                return this.lineaRepo.create({
                    cantidad: Number(linea.cantidad) || 1, modificacion: linea.modificacion,
                    pedido: { id: pedidoGuardado.id }, producto: { id: producto.id }           
                });
            });

            const lineasResueltas = await Promise.all(lineasParaGuardar);
            const lineasFinales = lineasResueltas.filter(linea => linea.producto && linea.producto.id); // Filtro de seguridad

            await this.lineaRepo.save(lineasFinales);

            const pedidoFinal = await this.pedidoRepo.findOne({ where: { id: pedidoGuardado.id }, relations: ["lineas", "lineas.producto", "ubicacion"] });
            if (!pedidoFinal) { throw new Error("El pedido se guardó pero no se pudo recuperar."); }

            return res.status(201).json(pedidoFinal);

        } catch (error) {
            console.error('ERROR CRÍTICO en PedidoController.save:', error);
            return res.status(500).json({ error: 'Fallo interno al crear el pedido.', details: error.message }); 
        }
    }

    // --- 2. ACTUALIZAR PEDIDO (PUT) ---
    async updatePedido(req: Request, res: Response) {
        const pedidoId = parseInt(req.params.id);
        const { lineas, estado, pagado, nombreCliente } = req.body;

        try {
            let pedido = await this.pedidoRepo.findOne({ where: { id: pedidoId }, relations: ["lineas"] });
            if (!pedido) { return res.status(404).json({ error: "Pedido no encontrado para actualizar." }); }
            
            // 1. ELIMINAR LÍNEAS ANTIGUAS (Para reemplazarlas completamente)
            if (pedido.lineas && pedido.lineas.length > 0) {
                await this.lineaRepo.remove(pedido.lineas); 
            }

            // 2. ACTUALIZAR PROPIEDADES BÁSICAS
            pedido.estado = estado || pedido.estado;
            pedido.pagado = pagado !== undefined ? pagado : pedido.pagado;
            pedido.formaPago = nombreCliente || pedido.formaPago; 
            pedido.total = 0; // Se mantiene en 0 para ser calculado en el frontend o por un trigger

            const pedidoActualizado = await this.pedidoRepo.save(pedido);

            // 3. CREAR Y GUARDAR LAS NUEVAS LÍNEAS TOTALES
            const lineasParaGuardar = lineas.map(async (linea: any) => {
                const productoId = linea?.producto?.id; 
                if (!productoId || typeof productoId !== 'number') { return null; /* Ignorar línea inválida */ }

                const producto = await this.productoRepo.findOneBy({ id: productoId });
                if (!producto) { return null; /* Ignorar si el producto no existe */ }

                return this.lineaRepo.create({
                    cantidad: Number(linea.cantidad) || 1, modificacion: linea.modificacion,
                    pedido: { id: pedidoActualizado.id }, producto: { id: producto.id }           
                });
            });

            // 4. Filtrar y Guardar
            const lineasResueltas = await Promise.all(lineasParaGuardar);
            // FILTRO FINAL: Solo guarda líneas que no son null (las que devolvió el map anterior)
            const lineasFinales = lineasResueltas.filter(linea => linea !== null); 
            
            await this.lineaRepo.save(lineasFinales);

            // 5. Devolver el Pedido Completo (La respuesta final no contendrá la línea defectuosa)
            const pedidoFinal = await this.pedidoRepo.findOne({
                where: { id: pedidoActualizado.id },
                relations: ["lineas", "lineas.producto", "ubicacion"],
            });
            
            // Filtro de la línea 'fantasma' en la respuesta final para prevenir errores de Angular.
            if (pedidoFinal && pedidoFinal.lineas) {
                 pedidoFinal.lineas = pedidoFinal.lineas.filter(linea => linea.producto !== null);
            }

            return res.json(pedidoFinal);

        } catch (error) {
            console.error('ERROR CRÍTICO en PedidoController.updatePedido:', error);
            return res.status(500).json({ error: 'Fallo interno al actualizar el pedido.', details: error.message });
        }
    }

    // --- 3. OBTENER PEDIDO ACTIVO POR MESA (Para el Camarero) ---
    async getPedidoActivoPorMesa(req: Request, res: Response) {
        const mesaId = parseInt(req.params.mesaId);
        try {
            const ubicacionEntity = await this.ubicacionRepo.findOneBy({ numero: mesaId, tipo: 'mesa' }); 
            if (!ubicacionEntity) { return res.status(404).json({ error: `La Mesa ${mesaId} no existe.` }); }
            
            const pedidoActivo = await this.pedidoRepo.findOne({
                where: { ubicacion: { id: ubicacionEntity.id }, pagado: false, estado: Not('servido') },
                relations: ["lineas", "lineas.producto", "ubicacion"],
                order: { fecha: "DESC" }
            });

            if (!pedidoActivo) { return res.status(404).json({ error: `No hay pedido activo para la Mesa ${mesaId}.` }); }
            
            // FILTRAR LÍNEAS DEFECTUOSAS EN LA RESPUESTA
            if (pedidoActivo.lineas) {
                pedidoActivo.lineas = pedidoActivo.lineas.filter(linea => linea.producto !== null);
            }

            return res.json(pedidoActivo);

        } catch (error) {
            console.error('Error al obtener pedido activo:', error);
            return res.status(500).json({ error: 'Fallo interno al buscar pedido activo.' });
        }
    }

    // --- 4. OBTENER PEDIDOS CONSOLIDADOS (Para Admin/Cocina) ---
    async getPedidosActivosAgrupados(req: Request, res: Response) {
        console.log('--- EJECUTANDO LÓGICA DE AGRUPACIÓN ---'); 
        try {
            const pedidosActivos = await this.pedidoRepo.find({
                where: { pagado: false, estado: Not('servido') },
                relations: ["lineas", "lineas.producto", "ubicacion"],
                order: { fecha: "ASC" } 
            });

            const pedidosAgrupados = pedidosActivos.reduce((acc: any, pedido: any) => {
                const key = `${pedido.ubicacion.tipo}_${pedido.ubicacion.numero || pedido.formaPago}`; 
                
                if (!acc[key]) {
                    acc[key] = { id: pedido.id, ubicacion: pedido.ubicacion, lineas: [], total: 0, nombreCliente: pedido.formaPago, estado: pedido.estado };
                }
                
                // Filtramos la línea defectuosa ANTES de consolidar
                const lineasValidas = pedido.lineas.filter((linea: any) => linea.producto !== null);

                acc[key].lineas.push(...lineasValidas);
                acc[key].total += Number(pedido.total); 
                return acc;
            }, {});
            
            return res.json(Object.values(pedidosAgrupados));

        } catch (error) {
            console.error('ERROR al agrupar pedidos:', error);
            return res.status(500).json({ error: 'Fallo al consolidar pedidos activos.' });
        }
    }
}