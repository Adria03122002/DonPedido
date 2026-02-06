import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);

  private getApiBaseUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;

    if (port === '4200') {
      return `http://${hostname}:3000/bar_app`;
    }
    
    return '/bar_app';
  }

  private readonly apiBaseUrl = this.getApiBaseUrl();
  private readonly apiUrl = `${this.apiBaseUrl}/usuarios`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  create(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  update(id: number, usuario: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}