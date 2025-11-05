import { Component } from '@angular/core';
import { Ingrediente } from 'src/app/interfaces/ingrediente';
import { IngredienteService } from 'src/app/services/ingrediente.service';

@Component({
  selector: 'app-crear-ingrediente',
  templateUrl: './crear-ingrediente.component.html',
  styleUrls: ['./crear-ingrediente.component.css']
})
export class CrearIngredienteComponent {
   nuevoIngrediente: Ingrediente = {} as Ingrediente;
  constructor(private ingredienteService: IngredienteService) {}

    tiposIngrediente: string[] = [
    'refresco',
    'alcohol',
    'pan',
    'carne',
    'pescado',
    'verdura',
    'fruta',
    'queso',
    'embutido',
    'dulce',
    'salsa',
    'otro'
  ];

   anyadirIngrediente() {
    if (this.nuevoIngrediente.stock < 0) {
      alert('El stock no puede ser negativo');
      return;
    }

    this.ingredienteService.create(this.nuevoIngrediente).subscribe({
      next: (ingrediente) => {
        alert('Ingrediente actualizado correctamente');
        this.nuevoIngrediente = {} as Ingrediente; // Reinicia el formulario
      },
      error: (err) => {
        alert('Error al añadir ingrediente');
        console.error(err);
      }
    });
  }


}
