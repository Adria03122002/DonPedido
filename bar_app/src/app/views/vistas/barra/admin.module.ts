import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './admin.component';
import { StockControlComponent } from '../stock-control/stock-control.component';
import { CrearIngredienteComponent } from '../crear-ingrediente/crear-ingrediente.component';
import { TiempoTranscurridoPipe } from 'src/app/pipes/tiempo-transcurrido.pipe';
import { PedidoComponent } from '../pedido/pedido.component';
import { CrearProductoComponent } from '../crear-producto/crear-producto.component';
import { ProductoListaComponent } from '../producto-lista/producto-lista.component';
import { CrearPedidoComponent } from '../crear-pedido/crear-pedido.component';

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
