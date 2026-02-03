"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializarSistema = inicializarSistema;
const Usuario_1 = require("../entity/Usuario");
const Rol_1 = require("../entity/Rol");
async function inicializarSistema(dataSource) {
    const usuarioRepo = dataSource.getRepository(Usuario_1.Usuario);
    const rolRepo = dataSource.getRepository(Rol_1.Rol);
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
    }
    catch (error) {
        console.error("❌ Error en el seeder:", error);
    }
}
//# sourceMappingURL=Admin_bootstrap.js.map