import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './admin.component';
import { StockControlComponent } from '../stock-control/stock-control.component';
import { CrearIngredienteComponent } from '../crear-ingrediente/crear-ingrediente.component';
import { TiempoTranscurridoPipe } from 'src/app/pipes/tiempo-transcurrido.pipe';
import { PedidoComponent } from '../pedido/pedido.component';

@NgModule({
  declarations: [
    AdminComponent,
    StockControlComponent,
    CrearIngredienteComponent,
    TiempoTranscurridoPipe,
    PedidoComponent,
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
