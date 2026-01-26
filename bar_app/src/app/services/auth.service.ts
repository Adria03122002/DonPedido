import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

/**
 * Interfaz para el usuario que devuelve el AuthController
 */
export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

/**
 * Interfaz para la respuesta completa del Login
 */
export interface LoginResponse {
  message: string;
  user: UserResponse;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // URL base configurada en el backend (index.ts + routes.ts)
  private readonly API_URL = 'http://localhost:3000/bar_app';

  // Usamos un Signal para mantener el estado del usuario actual de forma reactiva
  currentUser = signal<UserResponse | null>(null);

  constructor() {
    // Al cargar la App, verificamos si hay una sesión guardada previamente
    const savedUser = localStorage.getItem('don_pedido_session');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('don_pedido_session');
      }
    }
  }

  /**
   * Realiza la petición de login al AuthController del backend
   * @param credentials Objeto con email y password
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        // Si el login es correcto, guardamos el usuario y el token
        this.currentUser.set(response.user);
        localStorage.setItem('don_pedido_session', JSON.stringify(response.user));
        localStorage.setItem('don_pedido_token', response.token);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cierra la sesión limpiando el estado y el almacenamiento local
   */
  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('don_pedido_session');
    localStorage.removeItem('don_pedido_token');
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string | null {
    return this.currentUser()?.rol || null;
  }

  /**
   * Manejador de errores para las peticiones HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado.';
    
    if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas. Revisa tu email o contraseña.';
    } else if (error.status === 400) {
      errorMessage = 'Datos de acceso incompletos.';
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. ¿Está encendido el backend?';
    }

    return throwError(() => new Error(errorMessage));
  }
}