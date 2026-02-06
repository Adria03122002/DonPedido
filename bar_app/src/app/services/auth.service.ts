import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface Rol {
  id: number;
  nombre: string;
}

export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  rol: Rol | string;
}

export interface LoginResponse {
  success: boolean;
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
  
  private getApiUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;

    if (port === '4200') {
      return `http://${hostname}:3000/bar_app`;
    }
    
    return '/bar_app';
  }

  private readonly API_URL = this.getApiUrl();

  currentUser = signal<UserResponse | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('don_pedido_session');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('don_pedido_session');
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        this.currentUser.set(response.user);
        localStorage.setItem('don_pedido_session', JSON.stringify(response.user));
        localStorage.setItem('don_pedido_token', response.token);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('don_pedido_session');
    localStorage.removeItem('don_pedido_token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getUserRole(): string | null {
    const user = this.currentUser();
    if (!user) return null;
    return typeof user.rol === 'object' ? user.rol.nombre : user.rol;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado.';
    
    if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas. Revisa tu email o contraseña.';
    } else if (error.status === 404) {
      errorMessage = 'No se encontró el servidor de autenticación.';
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. ¿Está encendido el backend?';
    }

    return throwError(() => new Error(errorMessage));
  }
}