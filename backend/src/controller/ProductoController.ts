import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Producto } from "../entity/Producto";
import { ProductoIngrediente } from "../entity/ProductoIngrediente";

export class ProductoController {
  private productoRepository = AppDataSource.getRepository(Producto);

  async all(req: Request, res: Response) {
    const productos = await this.productoRepository.find({
      where: { disponible: true },
      relations: ["ingredientes", "ingredientes.ingrediente"]
    });

    if (!productos || productos.length === 0) {
      return "No hay productos disponibles";
    }

    return productos;
  }

  async one(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ["ingredientes", "ingredientes.ingrediente"]
    });

    if (!producto) {
      return "Producto no encontrado";
    }

    return producto;
  }

  async save(req: Request, res: Response) {
    try {
      const producto = await this.productoRepository.save(req.body);
      const saved = await this.productoRepository.findOne({
        where: { id: producto.id },
        relations: ["ingredientes", "ingredientes.ingrediente"]
      });
      return saved;
    } catch (error) {
      console.error("Error al guardar producto:", error);
      return "Error al guardar el producto";
    }
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      const piRepo = AppDataSource.getRepository(ProductoIngrediente);
      await piRepo.delete({ producto: { id } });
      
      await this.productoRepository.delete(id);

      return { message: "Producto y sus ingredientes eliminados correctamente" };
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).send("Error al eliminar producto");
    }
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    try {
      await this.productoRepository.update(id, req.body);

      const updated = await this.productoRepository.findOne({
        where: { id },
        relations: ["ingredientes", "ingredientes.ingrediente"]
      });

      return updated;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).send("Error al actualizar producto");
    }
  }


}
