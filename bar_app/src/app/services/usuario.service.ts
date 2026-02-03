import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/bar_app/usuarios'; // Cambia esto por tu URL real

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  create(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, usuario);
  }

  update(id: number, usuario: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, usuario);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}