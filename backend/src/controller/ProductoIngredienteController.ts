import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { ProductoIngrediente } from "../entity/ProductoIngrediente";
import { Producto } from "../entity/Producto";
import { Ingrediente } from "../entity/Ingrediente";

export class ProductoIngredienteController {
    private repo = AppDataSource.getRepository(ProductoIngrediente);
    private productoRepo = AppDataSource.getRepository(Producto);
    private ingredienteRepo = AppDataSource.getRepository(Ingrediente);

    // Obtener todas las relaciones producto-ingrediente
    async all(req: Request, res: Response) {
        return this.repo.find({ relations: ["producto", "ingrediente"] });
    }


    // Asignar un ingrediente a un producto (Definir receta)
    async save(req: Request, res: Response) {
        const { productoId, ingredienteId, cantidadNecesaria } = req.body;

        try {
            const producto = await this.productoRepo.findOneBy({ id: Number(productoId) });
            const ingrediente = await this.ingredienteRepo.findOneBy({ id: Number(ingredienteId) });

            if (!producto || !ingrediente) {
                res.status(404);
                return { message: "Producto o Ingrediente no encontrado" };
            }

            const relacion = new ProductoIngrediente();
            relacion.producto = producto;
            relacion.ingrediente = ingrediente;
            relacion.cantidadNecesaria = Number(cantidadNecesaria);

            return await this.repo.save(relacion);
        } catch (error) {
            res.status(500);
            return { message: "Error al crear la relación de receta" };
        }
    }

    // Ver la receta de un producto específico
    async getByProducto(req: Request, res: Response) {
        const { productoId } = req.params as any;
        try {
            return await this.repo.find({
                where: { producto: { id: Number(productoId) } },
                relations: ["ingrediente"]
            });
        } catch (error) {
            res.status(500);
            return { message: "Error al obtener la receta" };
        }
    }

    // Quitar un ingrediente de una receta
    async delete(req: Request, res: Response) {
        const { id } = req.params as any;
        try {
            const relacion = await this.repo.findOneBy({ id: Number(id) });
            if (!relacion) {
                res.status(404);
                return { message: "Relación no encontrada" };
            }
            await this.repo.remove(relacion);
            return { message: "Ingrediente quitado de la receta" };
        } catch (error) {
            res.status(500);
            return { message: "Error al eliminar" };
        }
    }
}