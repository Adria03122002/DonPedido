"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const AuthController_1 = require("./controller/AuthController");
const UsuarioController_1 = require("./controller/UsuarioController");
const ProductoController_1 = require("./controller/ProductoController");
const IngredienteController_1 = require("./controller/IngredienteController");
const LineaPedidoController_1 = require("./controller/LineaPedidoController");
const PedidoController_1 = require("./controller/PedidoController");
const ProductoIngredienteController_1 = require("./controller/ProductoIngredienteController");
exports.Routes = [
    // --- 1. AUTENTICACIÓN Y USUARIOS ---
    {
        method: "post",
        route: "login",
        controller: AuthController_1.AuthController,
        action: "login",
    },
    {
        method: "post",
        route: "usuarios",
        controller: UsuarioController_1.UsuarioController,
        action: "save",
    },
    {
        method: "get",
        route: "usuarios",
        controller: UsuarioController_1.UsuarioController,
        action: "all",
    },
    {
        method: "delete",
        route: "usuarios/:id",
        controller: UsuarioController_1.UsuarioController,
        action: "remove",
    },
    {
        method: "put",
        route: "usuarios/:id",
        controller: UsuarioController_1.UsuarioController,
        action: "update",
    },
    // --- 2. PRODUCTOS (CATÁLOGO) ---
    {
        method: "get",
        route: "productos",
        controller: ProductoController_1.ProductoController,
        action: "all",
    },
    {
        method: "get",
        route: "productos/:id",
        controller: ProductoController_1.ProductoController,
        action: "one",
    },
    {
        method: "post",
        route: "productos",
        controller: ProductoController_1.ProductoController,
        action: "save", // Crea uno nuevo
    },
    {
        method: "put",
        route: "productos/:id",
        controller: ProductoController_1.ProductoController,
        action: "update", // ARREGLO: Usa el nuevo método sincronizado para no duplicar
    },
    {
        method: "delete",
        route: "productos/:id",
        controller: ProductoController_1.ProductoController,
        action: "delete",
    },
    // --- 3. INGREDIENTES (ALMACÉN) ---
    {
        method: "get",
        route: "ingredientes",
        controller: IngredienteController_1.IngredienteController,
        action: "all",
    },
    {
        method: "post",
        route: "ingredientes",
        controller: IngredienteController_1.IngredienteController,
        action: "save",
    },
    {
        method: "put",
        route: "ingredientes/:id",
        controller: IngredienteController_1.IngredienteController,
        action: "update",
    },
    // --- 4. RECETAS (PRODUCTO-INGREDIENTES) ---
    {
        method: "get",
        route: "producto-ingredientes",
        controller: ProductoIngredienteController_1.ProductoIngredienteController,
        action: "all",
    },
    {
        method: "get",
        route: "producto-ingredientes/producto/:id",
        controller: ProductoIngredienteController_1.ProductoIngredienteController,
        action: "getByProducto",
    },
    {
        method: "post",
        route: "producto-ingredientes",
        controller: ProductoIngredienteController_1.ProductoIngredienteController,
        action: "save",
    },
    {
        method: "delete",
        route: "producto-ingredientes/:id",
        controller: ProductoIngredienteController_1.ProductoIngredienteController,
        action: "remove",
    },
    // --- 5. PEDIDOS (ORDEN CRÍTICO: RUTAS FIJAS ANTES QUE DINÁMICAS) ---
    {
        method: "get",
        route: "pedidos/activos",
        controller: PedidoController_1.PedidoController,
        action: "getPedidosActivos"
    },
    {
        method: "get",
        route: "pedidos/mapa-mesas",
        controller: PedidoController_1.PedidoController,
        action: "getMapaMesas"
    },
    {
        method: "get",
        route: "pedidos/mesa/:ubicacionString/activo",
        controller: PedidoController_1.PedidoController,
        action: "getPedidoActivoPorMesa"
    },
    {
        method: "get",
        route: "pedidos",
        controller: PedidoController_1.PedidoController,
        action: "all"
    },
    {
        method: "get",
        route: "pedidos/:id",
        controller: PedidoController_1.PedidoController,
        action: "one"
    },
    {
        method: "post",
        route: "pedidos",
        controller: PedidoController_1.PedidoController,
        action: "save"
    },
    {
        method: "put",
        route: "pedidos/:id",
        controller: PedidoController_1.PedidoController,
        action: "updatePedido"
    },
    {
        method: "put",
        route: "pedidos/:id/estado",
        controller: PedidoController_1.PedidoController,
        action: "actualizarEstado"
    },
    {
        method: "put",
        route: "pedidos/:id/pagar",
        controller: PedidoController_1.PedidoController,
        action: "marcarComoPagado"
    },
    {
        method: "delete",
        route: "pedidos/:id",
        controller: PedidoController_1.PedidoController,
        action: "delete"
    },
    // --- 6. LÍNEAS DE PEDIDO (AUXILIARES) ---
    {
        method: "get",
        route: "lineas-pedido",
        controller: LineaPedidoController_1.LineaPedidoController,
        action: "all",
    },
    {
        method: "get",
        route: "pedidos/:pedidoId/lineas",
        controller: LineaPedidoController_1.LineaPedidoController,
        action: "findByPedido",
    },
    {
        method: "post",
        route: "lineas-pedido",
        controller: LineaPedidoController_1.LineaPedidoController,
        action: "save",
    },
    {
        method: "put",
        route: "lineas-pedido/:id",
        controller: LineaPedidoController_1.LineaPedidoController,
        action: "update",
    },
    {
        method: "delete",
        route: "lineas-pedido/:id",
        controller: LineaPedidoController_1.LineaPedidoController,
        action: "delete",
    },
];
//# sourceMappingURL=routes.js.map