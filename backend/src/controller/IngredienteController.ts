import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ingrediente } from "../entity/Ingrediente";

export class IngredienteController {
  private ingredienteRepo = AppDataSource.getRepository(Ingrediente);

  // Obtener todos los ingredientes
  async all(req: Request, res: Response) {
    const ingredientes = await this.ingredienteRepo.find();
    if (!ingredientes || ingredientes.length === 0) {
      return "No hay ingredientes registrados";
    }
    return ingredientes;
  }

  // Obtener un ingrediente por ID
  async one(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const ingrediente = await this.ingredienteRepo.findOneBy({ id });

    if (!ingrediente) {
      return "Ingrediente no encontrado";
    }
    return ingrediente;
  }

  // Guardar o actualizar un ingrediente
  async save(req: Request, res: Response) {
    try {
      const data = req.body;

      let ingrediente = data.id
        ? await this.ingredienteRepo.findOneBy({ id: data.id })
        : new Ingrediente();

      if (!ingrediente) ingrediente = new Ingrediente();

      ingrediente.nombre = data.nombre;
      ingrediente.stock = data.stock;
      ingrediente.unidad = data.unidad;
      ingrediente.tipo = data.tipo;
      ingrediente.disponible = data.stock > 0;

      const saved = await this.ingredienteRepo.save(ingrediente);
      return saved;

    } catch (error) {
      console.error("Error al guardar ingrediente:", error);
      return { mensaje: "Error al guardar el ingrediente" };
    }
  }

}
