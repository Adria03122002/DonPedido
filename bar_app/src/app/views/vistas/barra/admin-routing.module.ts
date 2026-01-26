import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { PedidoComponent } from '../pedido/pedido.component';
import { StockControlComponent } from '../stock-control/stock-control.component';
import { CrearIngredienteComponent } from '../crear-ingrediente/crear-ingrediente.component';
import { CrearProductoComponent } from '../crear-producto/crear-producto.component';
import { CrearPedidoComponent } from '../crear-pedido/crear-pedido.component';
import { ProductoListaComponent } from '../producto-lista/producto-lista.component';
import { ModificarPedidoComponent } from '../pedido/modificar-pedido/modificar-pedido.component';
import { MapaMesasComponent } from './mapa-mesas/mapa-mesas.component';
import { UsuarioGestionComponent } from './usuario-gestion/usuario-gestion.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'pedidos', component: PedidoComponent },
      { path: 'stock', component: StockControlComponent },
      { path: 'stock/crear', component: CrearIngredienteComponent },
      { path: 'productos/crear', component: CrearProductoComponent },
      { path: 'crear', component: CrearPedidoComponent },
      { path: 'productos', component: ProductoListaComponent },
      { path: 'productos/editar/:id', component: CrearProductoComponent },
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      { path : 'pedidos/modificar/:id', component: ModificarPedidoComponent},
      { path: 'mapa-mesas', component: MapaMesasComponent},
      { path : 'usuarios', component: UsuarioGestionComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

