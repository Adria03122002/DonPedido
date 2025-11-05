import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"

const cors = require('cors');

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
     app.use(cors({
        origin: '*', // Dirección de origen permitida 
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos 
        allowedHeaders: ['*']
    }));
    app.use(bodyParser.json())

    // Crear un router para aplicar el prefijo /bar_app
    const router = express.Router();

    Routes.forEach(route => {
    (app as any)[route.method](route.route, async (req: Request, res: Response, next: Function) => {
        try {
        const controllerInstance = new (route.controller as any)();
        const result = await controllerInstance[route.action](req, res, next);

        // Solo respondemos si el resultado existe y no se ha enviado aún
        if (result !== undefined && !res.headersSent) {
            if (typeof result === 'object') {
            res.json(result);
            } else {
            res.send(result);
            }
        }

        } catch (error: any) {
        console.error('Error en la ruta:', route.route, error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Error interno del servidor' });
        }
        }
    });
    });



    // Montar el router con prefijo
    app.use("/bar_app", router);



    app.listen(3000)



    console.log("Express server has started on port 3000. Open http://localhost:3000/bar_app to see results")

}).catch(error => console.log(error))
