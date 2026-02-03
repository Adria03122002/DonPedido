"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Producto_1 = require("./entity/Producto");
const LineaPedido_1 = require("./entity/LineaPedido");
const Pedido_1 = require("./entity/Pedido");
const Ingrediente_1 = require("./entity/Ingrediente");
const ProductoIngrediente_1 = require("./entity/ProductoIngrediente");
const Rol_1 = require("./entity/Rol");
const Usuario_1 = require("./entity/Usuario");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "isca2025.",
    database: "bar_app",
    synchronize: false,
    logging: false,
    entities: [Producto_1.Producto, Pedido_1.Pedido, LineaPedido_1.LineaPedido, Ingrediente_1.Ingrediente, ProductoIngrediente_1.ProductoIngrediente, Rol_1.Rol, Usuario_1.Usuario],
    migrations: [],
    subscribers: [],
});
//# sourceMappingURL=data-source.js.map