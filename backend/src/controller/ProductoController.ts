import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Producto } from "../entity/Producto";
import { ProductoIngrediente } from "../entity/ProductoIngrediente";
import { Ingrediente } from "../entity/Ingrediente";
import { Repository } from "typeorm";

export class ProductoController {
    private productoRepo: Repository<Producto> = AppDataSource.getRepository(Producto);
    private recetaRepo: Repository<ProductoIngrediente> = AppDataSource.getRepository(ProductoIngrediente);
    private ingredienteRepo: Repository<Ingrediente> = AppDataSource.getRepository(Ingrediente);

    /**
     * Obtener todos los productos incluyendo su receta (ingredientes)
     */
    async all(req: Request, res: Response) {
        try {
            return await this.productoRepo.find({
                relations: ["ingredientes", "ingredientes.ingrediente"]
            });
        } catch (error: any) {
            res.status(500);
            return { error: "Error al cargar el catálogo de productos" };
        }
    }

    /**
     * Obtener un producto específico por ID
     */
    async one(req: Request, res: Response) {
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
            res.status(400);
            return { error: "ID inválido" };
        }

        const producto = await this.productoRepo.findOne({
            where: { id },
            relations: ["ingredientes", "ingredientes.ingrediente"]
        });

        if (!producto) {
            res.status(404);
            return { message: "Producto no encontrado" };
        }
        return producto;
    }

    /**
     * MÉTODO UPDATE: Soluciona el bug de duplicación y pérdida de ingredientes.
     */
    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        const { nombre, tipo, precio, imagenUrl, stock, disponible, ingredientes } = req.body;

        console.log(`\n--- [CATÁLOGO] EDITANDO PRODUCTO ID: ${id} ---`);

        if (isNaN(id)) {
            res.status(400);
            return { error: "El ID proporcionado no es un número válido" };
        }

        try {
            // 1. CARGAR PRODUCTO EXISTENTE
            // Es vital cargarlo primero para que TypeORM sepa que es una actualización y no una creación.
            let producto = await this.productoRepo.findOneBy({ id });

            if (!producto) {
                res.status(404);
                return { error: "El producto no existe en la base de datos" };
            }

            // 2. ACTUALIZAR CAMPOS BÁSICOS
            producto.nombre = nombre || producto.nombre;
            producto.tipo = tipo || producto.tipo;
            producto.precio = precio !== undefined ? Number(precio) : producto.precio;
            producto.imagenUrl = imagenUrl !== undefined ? imagenUrl : producto.imagenUrl;
            producto.disponible = disponible !== undefined ? disponible : producto.disponible;

            // Guardamos los cambios en la tabla Producto
            await this.productoRepo.save(producto);
            console.log("✅ Datos básicos del producto actualizados.");

            // 3. SINCRONIZAR RECETA (INGREDIENTES)
            // Para evitar duplicados o ingredientes "huérfanos", borramos la receta antigua antes de insertar la nueva.
            await AppDataSource
                .createQueryBuilder()
                .delete()
                .from(ProductoIngrediente)
                .where("productoId = :id", { id })
                .execute();
            
            console.log("🧹 Receta anterior eliminada correctamente.");

            // 4. INSERTAR NUEVOS INGREDIENTES
            if (ingredientes && Array.isArray(ingredientes)) {
                for (const item of ingredientes) {
                    const idIng = Number(item.ingredienteId || item.ingrediente?.id);
                    const ingredienteObj = await this.ingredienteRepo.findOneBy({ id: idIng });

                    if (ingredienteObj) {
                        const nuevaRelacion = this.recetaRepo.create({
                            producto: producto,
                            ingrediente: ingredienteObj,
                            cantidadNecesaria: Number(item.cantidadNecesaria || 1)
                        });
                        await this.recetaRepo.save(nuevaRelacion);
                    } else {
                        console.warn(`⚠️ Ingrediente ID ${idIng} no encontrado. Se ha omitido.`);
                    }
                }
                console.log(`🏗️ Receta reconstruida con ${ingredientes.length} ingredientes.`);
            }

            console.log("🚀 ACTUALIZACIÓN COMPLETADA: Producto sincronizado.");
            return { success: true, message: "Producto e ingredientes actualizados correctamente", id: producto.id };

        } catch (error: any) {
            console.error("🔥 Error crítico en UpdateProducto:", error.message);
            res.status(500);
            return { error: "Error interno al actualizar el producto", detalle: error.message };
        }
    }

    /**
     * Alternar disponibilidad rápidamente
     */
    async toggleStatus(req: Request, res: Response) {
        const id = Number(req.params.id);
        const producto = await this.productoRepo.findOneBy({ id });

        if (!producto) {
            res.status(404);
            return { message: "Producto no encontrado" };
        }

        producto.disponible = !producto.disponible;
        return await this.productoRepo.save(producto);
    }

    /**
     * Crear un nuevo producto desde cero
     */
    async save(req: Request, res: Response) {
        try {
            const { ingredientes, ...datosProducto } = req.body;
            
            // Creamos e insertamos el producto
            const nuevoProducto = this.productoRepo.create(datosProducto as Producto);
            const guardado = await this.productoRepo.save(nuevoProducto);

            // Guardamos la receta si se han enviado ingredientes
            if (ingredientes && Array.isArray(ingredientes)) {
                for (const item of ingredientes) {
                    const idIng = Number(item.ingredienteId || item.ingrediente?.id);
                    const ing = await this.ingredienteRepo.findOneBy({ id: idIng });
                    
                    if (ing) {
                        const rel = this.recetaRepo.create({
                            producto: guardado,
                            ingrediente: ing,
                            cantidadNecesaria: Number(item.cantidadNecesaria || 1)
                        });
                        await this.recetaRepo.save(rel);
                    }
                }
            }
            return guardado;
        } catch (error: any) {
            res.status(500);
            return { error: "No se pudo crear el producto", detalle: error.message };
        }
    }

    /**
     * Eliminar producto y sus dependencias
     */
    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            // Borramos primero la receta para evitar errores de integridad referencial
            await this.recetaRepo.delete({ producto: { id } });
            const result = await this.productoRepo.delete(id);
            
            if (result.affected === 0) {
                res.status(404);
                return { message: "Producto no encontrado para eliminar" };
            }
            
            return { message: "Producto y sus recetas eliminados correctamente" };
        } catch (error: any) {
            res.status(500);
            return { error: "Error al eliminar el producto", detalle: error.message };
        }
    }
}