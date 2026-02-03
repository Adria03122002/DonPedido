import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { ProductoIngrediente } from "../entity/ProductoIngrediente";
import { Producto } from "../entity/Producto";
import { Ingrediente } from "../entity/Ingrediente";

export class ProductoIngredienteController {
    private repo = AppDataSource.getRepository(ProductoIngrediente);
    private productoRepo = AppDataSource.getRepository(Producto);
    private ingredienteRepo = AppDataSource.getRepository(Ingrediente);

    // Obtener todas las relaciones
    async all(req: Request, res: Response) {
        return this.repo.find({ relations: ["producto", "ingrediente"] });
    }


    async save(req: Request, res: Response) {
        const { 
            productoId, ingredienteId, 
            producto, ingrediente, 
            cantidadNecesaria 
        } = req.body;

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
            } else {
                relacion = this.repo.create({
                    producto: pDB,
                    ingrediente: iDB,
                    cantidadNecesaria: Number(cantidadNecesaria || 1)
                });
            }

            const resultado = await this.repo.save(relacion);
            return resultado;

        } catch (error: any) {
            console.error("Error crítico en ProductoIngrediente save:", error.message);
            res.status(500);
            return { message: "Error al crear la relación de receta", detalle: error.message };
        }
    }

    /**
     * Ver la receta de un producto específico
     */
    async getByProducto(req: Request, res: Response) {
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
        } catch (error) {
            res.status(500);
            return { message: "Error al obtener la receta" };
        }
    }

    /**
     * Quitar un ingrediente de una receta
     */
    async delete(req: Request, res: Response) {
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
        } catch (error) {
            res.status(500);
            return { message: "Error al eliminar la relación" };
        }
    }
}