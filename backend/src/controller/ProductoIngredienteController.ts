import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ProductoIngrediente } from "../entity/ProductoIngrediente";

export class ProductoIngredienteController {
  private repo = AppDataSource.getRepository(ProductoIngrediente);

  async all(req: Request, res: Response) {
    const relaciones = await this.repo.find({ relations: ["producto", "ingrediente"] });
    if (!relaciones.length) return "no hay relaciones producto-ingrediente registradas";
    return relaciones;
  }

  async one(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const relacion = await this.repo.findOne({ where: { id }, relations: ["producto", "ingrediente"] });
    if (!relacion) return "relación producto-ingrediente no encontrada";
    return relacion;
  }

  async save(req: Request, res: Response) {
    const nuevaRelacion = await this.repo.save(req.body);
    return nuevaRelacion;
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const relacion = await this.repo.findOneBy({ id });
    if (!relacion) return "relación producto-ingrediente no encontrada";
    await this.repo.remove(relacion);
    return "relación producto-ingrediente eliminada correctamente";
  }

  async getByProducto(req: Request, res: Response) {
    const idProducto = parseInt(req.params.id);
    const relaciones = await this.repo.find({
      where: { producto: { id: idProducto } },
      relations: ["ingrediente"]
    });
    if (!relaciones.length) return "el producto no tiene ingredientes asociados";
    return relaciones;
  }
}
