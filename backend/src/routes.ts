import { AuthController } from "./controller/AuthController";
import { UsuarioController } from "./controller/UsuarioController";
import { ProductoController } from "./controller/ProductoController";
import { IngredienteController } from "./controller/IngredienteController";
import { LineaPedidoController } from "./controller/LineaPedidoController";
import { PedidoController } from "./controller/PedidoController";
import { ProductoIngredienteController } from "./controller/ProductoIngredienteController";

export const Routes = [
    // --- 1. AUTENTICACIÓN Y USUARIOS ---
    {
        method: "post",
        route: "/bar_app/login",
        controller: AuthController,
        action: "login",
    },
    {
        method: "post",
        route: "/bar_app/usuarios",
        controller: UsuarioController,
        action: "save",
    },
    {
        method: "get",
        route: "/bar_app/usuarios",
        controller: UsuarioController,
        action: "all",
    },
    {
        method: "delete",
        route: "/bar_app/usuarios/:id",
        controller: UsuarioController,
        action: "remove",
    },
    // --- 2. PRODUCTOS (CATÁLOGO) ---
    {
        method: "get",
        route: "/bar_app/productos",
        controller: ProductoController,
        action: "all",
    },
    {
        method: "get",
        route: "/bar_app/productos/:id",
        controller: ProductoController,
        action: "one",
    },
    {
        method: "post",
        route: "/bar_app/productos",
        controller: ProductoController,
        action: "save", // Crea uno nuevo
    },
    {
        method: "put",
        route: "/bar_app/productos/:id",
        controller: ProductoController,
        action: "update", // ARREGLO: Usa el nuevo método sincronizado para no duplicar
    },
    {
        method: "delete",
        route: "/bar_app/productos/:id",
        controller: ProductoController,
        action: "delete",
    },

    // --- 3. INGREDIENTES (ALMACÉN) ---
    {
        method: "get",
        route: "/bar_app/ingredientes",
        controller: IngredienteController,
        action: "all",
    },
    {
        method: "post",
        route: "/bar_app/ingredientes",
        controller: IngredienteController,
        action: "save",
    },
    {
        method: "put",
        route: "/bar_app/ingredientes/:id",
        controller: IngredienteController,
        action: "save",
    },

    // --- 4. RECETAS (PRODUCTO-INGREDIENTES) ---
    {
        method: "get",
        route: "/bar_app/producto-ingredientes",
        controller: ProductoIngredienteController,
        action: "all",
    },
    {
        method: "get",
        route: "/bar_app/producto-ingredientes/producto/:id",
        controller: ProductoIngredienteController,
        action: "getByProducto",
    },
    {
        method: "post",
        route: "/bar_app/producto-ingredientes",
        controller: ProductoIngredienteController,
        action: "save",
    },
    {
        method: "delete",
        route: "/bar_app/producto-ingredientes/:id",
        controller: ProductoIngredienteController,
        action: "remove",
    },

    // --- 5. PEDIDOS (ORDEN CRÍTICO: RUTAS FIJAS ANTES QUE DINÁMICAS) ---
     { 
        method: "get", 
        route: "/bar_app/pedidos/activos", 
        controller: PedidoController, 
        action: "getPedidosActivos" 
    },
    { 
        method: "get", 
        route: "/bar_app/pedidos/mapa-mesas", 
        controller: PedidoController, 
        action: "getMapaMesas" 
    },
    { 
        method: "get", 
        route: "/bar_app/pedidos/mesa/:ubicacionString/activo", 
        controller: PedidoController, 
        action: "getPedidoActivoPorMesa" 
    },
    { 
        method: "get", 
        route: "/bar_app/pedidos", 
        controller: PedidoController, 
        action: "all" 
    },
    { 
        method: "get", 
        route: "/bar_app/pedidos/:id", 
        controller: PedidoController, 
        action: "one" 
    },
    { 
        method: "post", 
        route: "/bar_app/pedidos", 
        controller: PedidoController, 
        action: "save" 
    },
    { 
        method: "put", 
        route: "/bar_app/pedidos/:id", 
        controller: PedidoController, 
        action: "updatePedido" 
    },
    { 
        method: "put", 
        route: "/bar_app/pedidos/:id/estado", 
        controller: PedidoController, 
        action: "actualizarEstado" 
    },
    { 
        method: "put", 
        route: "/bar_app/pedidos/:id/pagar", 
        controller: PedidoController, 
        action: "marcarComoPagado" 
    },
    { 
        method: "delete", 
        route: "/bar_app/pedidos/:id", 
        controller: PedidoController, 
        action: "delete" 
    },

    // --- 6. LÍNEAS DE PEDIDO (AUXILIARES) ---
    {
        method: "get",
        route: "/bar_app/lineas-pedido",
        controller: LineaPedidoController,
        action: "all",
    },
    {
        method: "get",
        route: "/bar_app/pedidos/:pedidoId/lineas",
        controller: LineaPedidoController,
        action: "findByPedido",
    },
    {
        method: "post",
        route: "/bar_app/lineas-pedido",
        controller: LineaPedidoController,
        action: "save",
    },
    {
        method: "put",
        route: "/bar_app/lineas-pedido/:id",
        controller: LineaPedidoController,
        action: "update",
    },
    {
        method: "delete",
        route: "/bar_app/lineas-pedido/:id",
        controller: LineaPedidoController,
        action: "delete",
    },
];