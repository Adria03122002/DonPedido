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
        route: "login",
        controller: AuthController,
        action: "login",
    },
    {
        method: "post",
        route: "usuarios",
        controller: UsuarioController,
        action: "save",
    },
    {
        method: "get",
        route: "usuarios",
        controller: UsuarioController,
        action: "all",
    },
    {
        method: "delete",
        route: "usuarios/:id",
        controller: UsuarioController,
        action: "remove",
    },
    {
        method: "put",
        route: "usuarios/:id",
        controller: UsuarioController,
        action: "update",
    },
    // --- 2. PRODUCTOS (CATÁLOGO) ---
    {
        method: "get",
        route: "productos",
        controller: ProductoController,
        action: "all",
    },
    {
        method: "get",
        route: "productos/:id",
        controller: ProductoController,
        action: "one",
    },
    {
        method: "post",
        route: "productos",
        controller: ProductoController,
        action: "save", // Crea uno nuevo
    },
    {
        method: "put",
        route: "productos/:id",
        controller: ProductoController,
        action: "update", // ARREGLO: Usa el nuevo método sincronizado para no duplicar
    },
    {
        method: "delete",
        route: "productos/:id",
        controller: ProductoController,
        action: "delete",
    },

    // --- 3. INGREDIENTES (ALMACÉN) ---
    {
        method: "get",
        route: "ingredientes",
        controller: IngredienteController,
        action: "all",
    },
    {
        method: "post",
        route: "ingredientes",
        controller: IngredienteController,
        action: "save",
    },
    {
        method: "put",
        route: "ingredientes/:id",
        controller: IngredienteController,
        action: "update",
    },

    // --- 4. RECETAS (PRODUCTO-INGREDIENTES) ---
    {
        method: "get",
        route: "producto-ingredientes",
        controller: ProductoIngredienteController,
        action: "all",
    },
    {
        method: "get",
        route: "producto-ingredientes/producto/:id",
        controller: ProductoIngredienteController,
        action: "getByProducto",
    },
    {
        method: "post",
        route: "producto-ingredientes",
        controller: ProductoIngredienteController,
        action: "save",
    },
    {
        method: "delete",
        route: "producto-ingredientes/:id",
        controller: ProductoIngredienteController,
        action: "remove",
    },

    // --- 5. PEDIDOS (ORDEN CRÍTICO: RUTAS FIJAS ANTES QUE DINÁMICAS) ---
     { 
        method: "get", 
        route: "pedidos/activos", 
        controller: PedidoController, 
        action: "getPedidosActivos" 
    },
    { 
        method: "get", 
        route: "pedidos/mapa-mesas", 
        controller: PedidoController, 
        action: "getMapaMesas" 
    },
    { 
        method: "get", 
        route: "pedidos/mesa/:ubicacionString/activo", 
        controller: PedidoController, 
        action: "getPedidoActivoPorMesa" 
    },
    { 
        method: "get", 
        route: "pedidos", 
        controller: PedidoController, 
        action: "all" 
    },
    { 
        method: "get", 
        route: "pedidos/:id", 
        controller: PedidoController, 
        action: "one" 
    },
    { 
        method: "post", 
        route: "pedidos", 
        controller: PedidoController, 
        action: "save" 
    },
    { 
        method: "put", 
        route: "pedidos/:id", 
        controller: PedidoController, 
        action: "updatePedido" 
    },
    { 
        method: "put", 
        route: "pedidos/:id/estado", 
        controller: PedidoController, 
        action: "actualizarEstado" 
    },
    { 
        method: "put", 
        route: "pedidos/:id/pagar", 
        controller: PedidoController, 
        action: "marcarComoPagado" 
    },
    { 
        method: "delete", 
        route: "pedidos/:id", 
        controller: PedidoController, 
        action: "delete" 
    },

    // --- 6. LÍNEAS DE PEDIDO (AUXILIARES) ---
    {
        method: "get",
        route: "lineas-pedido",
        controller: LineaPedidoController,
        action: "all",
    },
    {
        method: "get",
        route: "pedidos/:pedidoId/lineas",
        controller: LineaPedidoController,
        action: "findByPedido",
    },
    {
        method: "post",
        route: "lineas-pedido",
        controller: LineaPedidoController,
        action: "save",
    },
    {
        method: "put",
        route: "lineas-pedido/:id",
        controller: LineaPedidoController,
        action: "update",
    },
    {
        method: "delete",
        route: "lineas-pedido/:id",
        controller: LineaPedidoController,
        action: "delete",
    },
];