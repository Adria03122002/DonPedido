import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { Ingrediente } from "../entity/Ingrediente";
import { LessThan } from "typeorm";

export class IngredienteController {
    private repo = AppDataSource.getRepository(Ingrediente);

    // Ver stock actual (Lista completa)
    async all(req: Request, res: Response) {
        try {
            return await this.repo.find({
                order: { nombre: "ASC" }
            });
        } catch (error) {
            res.status(500);
            return { message: "Error al cargar el inventario" };
        }
    }

    // Obtener un solo ingrediente por ID
    async one(req: Request, res: Response) {
        const { id } = req.params as any;
        try {
            const item = await this.repo.findOneBy({ id: Number(id) });
            if (!item) {
                res.status(404);
                return { message: "Ingrediente no encontrado" };
            }
            return item;
        } catch (error) {
            res.status(500);
            return { message: "Error al buscar el ingrediente" };
        }
    }

    // Añadir o actualizar ingrediente
    async save(req: Request, res: Response) {
        const { nombre, cantidad, unidad } = req.body;

        try {
            const item = new Ingrediente();
            item.nombre = String(nombre);
            item.cantidad = Number(cantidad);
            item.unidad = String(unidad || "uds");

            return await this.repo.save(item);
        } catch (error: any) {
            res.status(500);
            return { message: "Error al procesar el ingrediente", error: error.message };
        }
    }

    // Ajuste rápido de inventario (Entrada de proveedor o merma)
    async updateStock(req: Request, res: Response) {
        const { id } = req.params as any;
        const { nuevaCantidad } = req.body;

        try {
            const item = await this.repo.findOneBy({ id: Number(id) });
            if (!item) {
                res.status(404);
                return { message: "Ingrediente no encontrado" };
            }

            item.cantidad = Number(nuevaCantidad);
            return await this.repo.save(item);
        } catch (error) {
            res.status(500);
            return { message: "Error al actualizar stock" };
        }
    }

    // Eliminar ingrediente del sistema
    async remove(req: Request, res: Response) {
        const { id } = req.params as any;
        try {
            const item = await this.repo.findOneBy({ id: Number(id) });
            if (!item) {
                res.status(404);
                return { message: "El ingrediente no existe" };
            }
            await this.repo.remove(item);
            return { message: "Ingrediente eliminado del almacén" };
        } catch (error) {
            res.status(500);
            return { message: "Error al eliminar el ingrediente" };
        }
    }

    // LÓGICA DE NEGOCIO: Obtener ingredientes con poco stock (menos de 5 unidades)
    async getBajoStock(req: Request, res: Response) {
        try {
            return await this.repo.find({
                where: {
                    cantidad: LessThan(5)
                }
            });
        } catch (error) {
            res.status(500);
            return { message: "Error al consultar alertas de stock" };
        }
    }
}