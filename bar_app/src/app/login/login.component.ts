import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Modelo para el formulario
  loginData = {
    email: '',
    password: ''
  };

  // Estados de la UI
  cargando = false;
  errorMsg = '';

  /**
   * Procesa el intento de entrada al sistema
   */
  onSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMsg = 'Por favor, rellena todos los campos.';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('✅ Login exitoso:', res.user.nombre);
        this.redirigirSegunRol(res.user.rol as string);
      },
      error: (err) => {
        this.cargando = false;
        // Mostramos el mensaje que viene del backend o uno genérico
        this.errorMsg = err.message || 'Error al conectar con el servidor.';
      }
    });
  }

  /**
   * Envía al usuario a su pantalla de trabajo correspondiente
   */
  private redirigirSegunRol(rol: string) {
    const rolNormalizado = rol.toLowerCase();

    switch (rolNormalizado) {
      case 'admin':
      case 'administrador':
        this.router.navigate(['/barra']);
        break;
      
      case 'camarero':
        this.router.navigate(['/camarero']);
        break;
      
      case 'cocina':
      case 'cocinero':
        this.router.navigate(['/cocina']);
        break;

      default:
        // Si no detectamos el rol, vamos a la lista de pedidos general
        this.router.navigate(['/barra/pedidos']);
        break;
    }
  }
}