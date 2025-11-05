import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LineaPedido } from "../entity/LineaPedido";

export class LineaPedidoController {
  private lineaPedidoRepo = AppDataSource.getRepository(LineaPedido);

  async all(req: Request, res: Response) {
    const lineas = await this.lineaPedidoRepo.find({ relations: ["producto", "pedido"] });
    if (!lineas || lineas.length === 0) return "no hay líneas de pedido registradas";
    return lineas;
  }

  async one(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const linea = await this.lineaPedidoRepo.findOne({ where: { id }, relations: ["producto", "pedido"] });
    if (!linea) return "línea de pedido no encontrada";
    return linea;
  }

  async save(req: Request, res: Response) {
    const linea = await this.lineaPedidoRepo.save(req.body);
    return linea;
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    let linea = await this.lineaPedidoRepo.findOneBy({ id });

    if (!linea) return "línea de pedido no encontrada";

    // Puedes personalizar más campos si quieres restringir cambios
    Object.assign(linea, req.body);

    const updated = await this.lineaPedidoRepo.save(linea);
    return updated;
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const linea = await this.lineaPedidoRepo.findOneBy({ id });
    if (!linea) return "línea de pedido no encontrada";

    await this.lineaPedidoRepo.remove(linea);
    return "línea de pedido eliminada correctamente";
  }

  async findByPedido(req: Request, res: Response) {
    const pedidoId = parseInt(req.params.pedidoId);
    const lineas = await this.lineaPedidoRepo.find({
      where: { pedido: { id: pedidoId } },
      relations: ["producto", "pedido"],
    });

    if (!lineas || lineas.length === 0) return "no hay líneas para ese pedido";
    return lineas;
  }
}
