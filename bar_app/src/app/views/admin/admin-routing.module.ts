import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { StockControlComponent } from '../vistas/stock-control/stock-control.component';
import { CrearIngredienteComponent } from '../vistas/crear-ingrediente/crear-ingrediente.component';
import { CrearPedidoComponent } from '../vistas/crear-pedido/crear-pedido.component';
import { PedidoComponent } from '../vistas/pedido/pedido.component';
import { CrearProductoComponent } from '../vistas/crear-producto/crear-producto.component';
import { ProductoListaComponent } from '../vistas/producto-lista/producto-lista.component';

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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

