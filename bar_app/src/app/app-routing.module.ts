import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CamareroComponent } from './camarero/camarero.component';
import { CocineroComponent } from './cocinero/cocinero.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'camarero', component: CamareroComponent },
  { path: 'cocina', component: CocineroComponent },
  {
    path: 'barra',
    loadChildren: () =>
      import('./views/admin/admin.module').then(m => m.AdminModule),
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
