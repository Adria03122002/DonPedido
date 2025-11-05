import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './admin.component';
import { StockControlComponent } from '../vistas/stock-control/stock-control.component';
import { CrearIngredienteComponent } from '../vistas/crear-ingrediente/crear-ingrediente.component';
import { TiempoTranscurridoPipe } from 'src/app/pipes/tiempo-transcurrido.pipe';
import { PedidoComponent } from '../vistas/pedido/pedido.component';
import { CrearProductoComponent } from '../vistas/crear-producto/crear-producto.component';
import { ProductoListaComponent } from '../vistas/producto-lista/producto-lista.component';
import { CrearPedidoComponent } from '../vistas/crear-pedido/crear-pedido.component';
@NgModule({
  declarations: [
    AdminComponent,
    StockControlComponent,
    CrearIngredienteComponent,
    TiempoTranscurridoPipe,
    PedidoComponent,
    CrearProductoComponent,
    ProductoListaComponent, 
    CrearPedidoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
  ],
  exports: [
    AdminComponent
  ]
})
export class AdminModule {}
