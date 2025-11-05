import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ubicacion } from "../entity/Ubicacion";

export class UbicacionController {
  private ubicacionRepo = AppDataSource.getRepository(Ubicacion);

  async all(req: Request, res: Response) {
    const ubicaciones = await this.ubicacionRepo.find();
    return ubicaciones;
  }

  async one(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const ubicacion = await this.ubicacionRepo.findOneBy({ id });
    if (!ubicacion) return "ubicación no encontrada";
    return ubicacion;
  }

  async save(req: Request, res: Response) {
    const nuevaUbicacion = await this.ubicacionRepo.save(req.body);
    return nuevaUbicacion;
  }

  async updateEstado(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { estado } = req.body;

    const ubicacion = await this.ubicacionRepo.findOneBy({ id });
    if (!ubicacion) return "ubicación no encontrada";

    ubicacion.estado = estado;
    return await this.ubicacionRepo.save(ubicacion);
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const ubicacion = await this.ubicacionRepo.findOneBy({ id });
    if (!ubicacion) return "ubicación no encontrada";

    await this.ubicacionRepo.remove(ubicacion);
    return "ubicación eliminada correctamente";
  }
}
