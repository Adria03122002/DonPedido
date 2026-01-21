import { IngredienteController } from "./controller/IngredienteController";
import { LineaPedidoController } from "./controller/LineaPedidoController";
import { PedidoController } from "./controller/PedidoController";
import { ProductoController } from "./controller/ProductoController";
import { ProductoIngredienteController } from "./controller/ProductoIngredienteController";
import { UsuarioController } from "./controller/UsuarioController";
import { AuthController } from "./controller/AuthController";       

export const Routes = [
  // --- AUTENTICACIÓN (LOGIN) ---
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
  // --- PRODUCTOS ---
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
    action: "save",
  },
  {
    method: "delete",
    route: "/bar_app/productos/:id",
    controller: ProductoController,
    action: "delete"
  },
  {
    method: "put",
    route: "/bar_app/productos/:id",
    controller: ProductoController,
    action: "update"
  },

  // --- INGREDIENTES ---
  {
    method: "get",
    route: "/bar_app/ingredientes",
    controller: IngredienteController,
    action: "all",
  },
  {
    method: "get",
    route: "/bar_app/ingredientes/:id",
    controller: IngredienteController,
    action: "one",
  },
  {
    method: "post",
    route: "/bar_app/ingredientes",
    controller: IngredienteController,
    action: "save"
  },
  {
    method: "put",
    route: "/bar_app/ingredientes/:id",
    controller: IngredienteController,
    action: "updateStock"
  },

  // --- LINEAS DE PEDIDO ---
  {
    method: "get",
    route: "/bar_app/lineas-pedido",
    controller: LineaPedidoController,
    action: "all"
  },
  {
    method: "post",
    route: "/bar_app/lineas-pedido",
    controller: LineaPedidoController,
    action: "save"
  },
  {
    method: "put",
    route: "/bar_app/lineas-pedido/:id",
    controller: LineaPedidoController,
    action: "update"
  },
  {
    method: "delete",
    route: "/bar_app/lineas-pedido/:id",
    controller: LineaPedidoController,
    action: "delete"
  },
  {
    method: "get",
    route: "/bar_app/pedidos/:pedidoId/lineas",
    controller: LineaPedidoController,
    action: "findByPedido"
  },

  // --- PEDIDOS ---
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
    method: "delete",
    route: "/bar_app/pedidos/:id",
    controller: PedidoController,
    action: "delete"
  },
  {
    method: "put",
    route: "/bar_app/pedidos/:id/estado",
    controller: PedidoController,
    action: "updatePedido"
  },
  {
    method: "put", 
    route: "/bar_app/pedidos/:id/pagar",
    controller: PedidoController,
    action: "marcarComoPagado"
  },
  {
    method: "get",
    route: "/bar_app/pedidos/mesa/:ubicacionString/activo",
    controller: PedidoController,
    action: "getPedidoActivoPorMesa",
  },
  {
    method: "get",
    route: "/bar_app/pedidos/activos",
    controller: PedidoController,
    action: "getPedidosActivos",
  },
  {
    method: "put",
    route: "/bar_app/pedidos/:id",
    controller: PedidoController,
    action: "updatePedido",
  },

  // --- PRODUCTO-INGREDIENTES (Recetas) ---
  {
    method: "get",
    route: "/bar_app/producto-ingredientes",
    controller: ProductoIngredienteController,
    action: "all",
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
    action: "delete",
  },
  {
    method: "get",
    route: "/bar_app/producto-ingredientes/producto/:id",
    controller: ProductoIngredienteController,
    action: "getByProducto",
  },
];