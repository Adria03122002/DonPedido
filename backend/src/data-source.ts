import "reflect-metadata"
import { DataSource } from "typeorm"
import { Ubicacion } from './entity/Ubicacion';
import { Producto } from './entity/Producto';
import { LineaPedido } from './entity/LineaPedido';
import { Pedido } from "./entity/Pedido";
import { Ingrediente } from "./entity/Ingrediente";
import { ProductoIngrediente } from "./entity/ProductoIngrediente";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "isca2025.",
    database: "bar_app",
    synchronize: false,
    logging: false,
    entities: [Ubicacion, Producto, Pedido, LineaPedido, Ingrediente, ProductoIngrediente],
    migrations: [],
    subscribers: [],
})
