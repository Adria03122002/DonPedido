import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private router: Router) {}

  seleccionarRol(rol: string) {
    localStorage.setItem('rol', rol);  // Guardamos el rol
    this.router.navigate(['/'+rol]);   // Redirige a home o lo que tú quieras
  }
}
