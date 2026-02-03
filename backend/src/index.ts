// Usamos require para evitar errores de compatibilidad en el dist de Windows
const express = require('express');
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";
import path from "path";
import { inicializarSistema } from "./controller/Admin_bootstrap";

const cors = require('cors');

AppDataSource.initialize().then(async () => {

    await inicializarSistema(AppDataSource);
    
    const app = express();
    
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const publicPath = path.resolve(__dirname, "..", "public");
    app.use(express.static(publicPath));

    console.log("--------------------------------------------------");
    console.log("🛰️  SISTEMA DE RUTAS API (Backend):");

    Routes.forEach(route => {
        const cleanRoute = route.route.startsWith('/') ? route.route.substring(1) : route.route;
        const apiPath = "/bar_app/" + cleanRoute;

        (app as any)[route.method](apiPath, async (req: Request, res: Response, next: Function) => {
            try {
                const controllerInstance = new (route.controller as any)();
                const result = await controllerInstance[route.action](req, res, next);

                if (result !== undefined && !res.headersSent) {
                    if (typeof result === 'object') {
                        res.json(result);
                    } else {
                        res.send(result);
                    }
                }
            } catch (error: any) {
                console.error(`❌ Error en ${apiPath}:`, error);
                if (!res.headersSent) {
                    res.status(500).json({ error: "Error interno del servidor" });
                }
            }
        });
        console.log(` ✅ [${route.method.toUpperCase()}] -> ${apiPath}`);
    });

    app.get('*', (req: Request, res: Response) => {
        if (req.path.startsWith('/bar_app')) {
             return res.status(404).json({ message: "API: Ruta no encontrada o método inválido" });
        }
        
        res.sendFile(path.join(publicPath, 'index.html'));
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log("--------------------------------------------------");
        console.log(`🚀 SERVIDOR UNIFICADO ACTIVO EN PUERTO ${PORT}`);
        console.log(`🔗 WEB (Acceso Usuario): http://localhost:${PORT}`);
        console.log(`📂 CARPETA PUBLIC: ${publicPath}`);
        console.log("--------------------------------------------------");
    });

}).catch(error => {
    console.error("❌ ERROR CRÍTICO AL INICIAR EL SISTEMA:");
    console.error(error);
});