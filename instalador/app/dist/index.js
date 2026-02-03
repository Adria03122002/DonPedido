"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Usamos require para evitar errores de compatibilidad en el dist de Windows
const express = require('express');
const bodyParser = __importStar(require("body-parser"));
const data_source_1 = require("./data-source");
const routes_1 = require("./routes");
const path_1 = __importDefault(require("path"));
const Admin_bootstrap_1 = require("./controller/Admin_bootstrap");
const cors = require('cors');
data_source_1.AppDataSource.initialize().then(async () => {
    await (0, Admin_bootstrap_1.inicializarSistema)(data_source_1.AppDataSource);
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    const publicPath = path_1.default.resolve(__dirname, "..", "public");
    app.use(express.static(publicPath));
    console.log("--------------------------------------------------");
    console.log("🛰️  SISTEMA DE RUTAS API (Backend):");
    routes_1.Routes.forEach(route => {
        const cleanRoute = route.route.startsWith('/') ? route.route.substring(1) : route.route;
        const apiPath = "/bar_app/" + cleanRoute;
        app[route.method](apiPath, async (req, res, next) => {
            try {
                const controllerInstance = new route.controller();
                const result = await controllerInstance[route.action](req, res, next);
                if (result !== undefined && !res.headersSent) {
                    if (typeof result === 'object') {
                        res.json(result);
                    }
                    else {
                        res.send(result);
                    }
                }
            }
            catch (error) {
                console.error(`❌ Error en ${apiPath}:`, error);
                if (!res.headersSent) {
                    res.status(500).json({ error: "Error interno del servidor" });
                }
            }
        });
        console.log(` ✅ [${route.method.toUpperCase()}] -> ${apiPath}`);
    });
    app.get('*', (req, res) => {
        if (req.path.startsWith('/bar_app')) {
            return res.status(404).json({ message: "API: Ruta no encontrada o método inválido" });
        }
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
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
//# sourceMappingURL=index.js.map