import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { Producto } from "../entity/Producto";

export class ProductoController {
    private repo = AppDataSource.getRepository(Producto);

    // Listar todos los productos (Carta)
    async all(req: Request, res: Response) {
        return this.repo.find({
            relations: ["ingredientes", "ingredientes.ingrediente"]
        });
    }

    // Obtener un producto específico
    async one(req: Request, res: Response) {
        const { id } = req.params as any;
        return this.repo.findOne({
            where: { id: Number(id) },
            relations: ["ingredientes", "ingredientes.ingrediente"]
        });
    }

    // Crear o editar producto
    async save(req: Request, res: Response) {
        const { nombre, tipo, precio, imagenUrl, disponible } = req.body;

        try {
            const producto = new Producto();
            producto.nombre = nombre;
            producto.tipo = tipo;
            producto.precio = Number(precio);
            producto.imagenUrl = imagenUrl || "";
            producto.disponible = disponible !== undefined ? disponible : true;

            return await this.repo.save(producto);
        } catch (error: any) {
            res.status(500);
            return { message: "Error al guardar el producto", error: error.message };
        }
    }

    // Alternar disponibilidad (Agotado/Disponible)
    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params as any;
        const producto = await this.repo.findOneBy({ id: Number(id) });

        if (!producto) {
            res.status(404);
            return { message: "Producto no encontrado" };
        }

        producto.disponible = !producto.disponible;
        return await this.repo.save(producto);
    }

    // Eliminar producto
    async delete(req: Request, res: Response) {
        const { id } = req.params as any;
        const prod = await this.repo.findOneBy({ id: Number(id) });
        if (!prod) return { message: "No existe el producto" };
        
        await this.repo.remove(prod);
        return { message: "Producto eliminado correctamente" };
    }
}