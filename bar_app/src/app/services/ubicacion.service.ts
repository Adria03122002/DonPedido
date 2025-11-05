import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ubicacion } from '../interfaces/ubicacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private apiUrl = 'http://localhost:3000/bar_app/ubicaciones';

  constructor(private http: HttpClient) {}

  getUbicaciones(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.apiUrl);
  }

  getUbicacion(id: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(`${this.apiUrl}/${id}`);
  }

  crearUbicacion(ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.apiUrl, ubicacion);
  }

  actualizarUbicacion(id: number, ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.apiUrl}/${id}`, ubicacion);
  }

  eliminarUbicacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
