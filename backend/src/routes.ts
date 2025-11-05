import { IngredienteController } from "./controller/IngredienteController";
import { LineaPedidoController } from "./controller/LineaPedidoController";
import { PedidoController } from "./controller/PedidoController";
import { ProductoController } from "./controller/ProductoController";
import { ProductoIngredienteController } from "./controller/ProductoIngredienteController";
import { UbicacionController } from "./controller/UbicacionController";

export const Routes = [
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
  route: "/bar_app/ingredientes/",
  controller: IngredienteController,
  action: "save"
},
{
  method: "put",
  route: "/bar_app/ingredientes/:id",
  controller: IngredienteController,
  action: "save"
}
, //EMPIEZA LINEAPEDIDO
{
  method: "get",
  route: "/bar_app/lineas-pedido",
  controller: LineaPedidoController,
  action: "all"
},
{
  method: "get",
  route: "/bar_app/lineas-pedido/:id",
  controller: LineaPedidoController,
  action: "one"
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
  action: "remove"
},
{
  method: "get",
  route: "/bar_app/pedidos/:pedidoId/lineas",
  controller: LineaPedidoController,
  action: "findByPedido"
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
  method: "delete",
  route: "/bar_app/pedidos/:id",
  controller: PedidoController,
  action: "delete"
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
  route: "/bar_app/cerrar-caja",
  controller: PedidoController,
  action: "cerrarCaja"
},{
  method: "get",
  route: "/bar_app/ubicaciones",
  controller: UbicacionController,
  action: "all",
},
{
  method: "get",
  route: "/bar_app/ubicaciones/:id",
  controller: UbicacionController,
  action: "one",
},
{
  method: "post",
  route: "/bar_app/ubicaciones",
  controller: UbicacionController,
  action: "save",
},
{
  method: "put",
  route: "/bar_app/ubicaciones/:id/estado",
  controller: UbicacionController,
  action: "updateEstado",
},
{
  method: "delete",
  route: "/bar_app/ubicaciones/:id",
  controller: UbicacionController,
  action: "delete",
},

{
  method: "get",
  route: "/bar_app/producto-ingredientes",
  controller: ProductoIngredienteController,
  action: "all",
},
{
  method: "get",
  route: "/bar_app/producto-ingredientes/:id",
  controller: ProductoIngredienteController,
  action: "one",
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
  route: "/bar_app/producto-ingredientes/producto/:productoId",
  controller: ProductoIngredienteController,
  action: "getByProducto",
},{
  method: "get",
  route: "/bar_app/pedidos/mesa/:mesaId/activo",
  controller: PedidoController,
  action: "getPedidoActivoPorMesa",
},
{
  method: "get",
  route: "/bar_app/pedidos/activos/agrupados",
  controller: PedidoController,
  action: "getPedidosActivosAgrupados", 
},
{
  method: "put",
  route: "/bar_app/pedidos/:id", 
  controller: PedidoController,
  action: "updatePedido", 
},

];
