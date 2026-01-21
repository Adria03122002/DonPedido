import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CocineroComponent } from './cocinero/cocinero.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { CamareroComponent } from './camarero/camarero.component';
import { IngredienteService } from './services/ingrediente.service';
import { PedidoService } from './services/pedido.service';
import { ProductoService } from './services/producto.service';
import { LineaPedidoService } from './services/linea-pedido.service';
import { ProductoIngredienteService } from './services/producto-ingrediente.service';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@NgModule({
declarations: [
  AppComponent,
  LoginComponent,
  CamareroComponent,
  CocineroComponent,
],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [IngredienteService, PedidoService, ProductoService, LineaPedidoService, ProductoIngredienteService],
  bootstrap: [AppComponent]
})
export class AppModule { }
