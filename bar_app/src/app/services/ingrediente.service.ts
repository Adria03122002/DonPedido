import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingrediente } from '../interfaces/ingrediente';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private http = inject(HttpClient);

  private getApiUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;

    if (port === '4200') {
      return `http://${hostname}:3000/bar_app/ingredientes`;
    }
    
    return '/bar_app/ingredientes';
  }

  private readonly apiUrl = this.getApiUrl();

  private readonly tiposIngrediente: string[] = [
    'refresco',
    'alcohol',
    'pan',
    'carne',
    'pescado',
    'marisco',
    'verdura',
    'fruta',
    'queso',
    'lácteo',
    'huevo',
    'embutido',
    'dulce',
    'salsa',
    'aceite',
    'harina',
    'arroz',
    'especias',
    'preparado',
    'otro'
  ];

  getAll(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Ingrediente> {
    return this.http.get<Ingrediente>(`${this.apiUrl}/${id}`);
  }

  create(ingrediente: Ingrediente): Observable<Ingrediente> {
    return this.http.post<Ingrediente>(this.apiUrl, ingrediente);
  }

  update(id: number, ingrediente: Ingrediente): Observable<Ingrediente> {
    return this.http.put<Ingrediente>(`${this.apiUrl}/${id}`, ingrediente);
  }

  getTiposIngrediente(): string[] {
    return [...this.tiposIngrediente]; 
  }
}