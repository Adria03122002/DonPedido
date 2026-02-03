import { DataSource } from "typeorm";
import { Usuario } from "../entity/Usuario";
import { Rol } from "../entity/Rol";       
import * as bcrypt from "bcryptjs";

export async function inicializarSistema(dataSource: DataSource) {
  const usuarioRepo = dataSource.getRepository(Usuario);
  const rolRepo = dataSource.getRepository(Rol);

  try {
    const totalRoles = await rolRepo.count();
    if (totalRoles === 0) {
      await rolRepo.save([
        { id: 1, nombre: 'Administrador' },
        { id: 2, nombre: 'Camarero' },
        { id: 3, nombre: 'Cocinero' }
      ]);
      console.log("✅ Roles iniciales creados.");
    }

    const adminEmail = "admin@donpedido.com";
    const adminExiste = await usuarioRepo.findOne({ where: { email: adminEmail } });

    if (!adminExiste) {
      const rolAdmin = await rolRepo.findOne({ where: { nombre: 'Administrador' } });
      if (rolAdmin) {
        const nuevoAdmin = usuarioRepo.create({
          nombre: "Admin Principal",
          email: adminEmail,
          passwordHash: "admin1234",
          rol: rolAdmin
        });
        await usuarioRepo.save(nuevoAdmin);
        console.log("✅ Admin creado: admin@donpedido.com / admin1234");
      }
    }
  } catch (error) {
    console.error("❌ Error en el seeder:", error);
  }
}