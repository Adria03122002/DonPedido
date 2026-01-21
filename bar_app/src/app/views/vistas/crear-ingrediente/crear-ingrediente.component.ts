import { Component, OnInit } from '@angular/core';
import { Ingrediente } from 'src/app/interfaces/ingrediente';
import { IngredienteService } from 'src/app/services/ingrediente.service';

@Component({
  selector: 'app-crear-ingrediente',
  templateUrl: './crear-ingrediente.component.html',
  styleUrls: ['./crear-ingrediente.component.css']
})
export class CrearIngredienteComponent implements OnInit {
  nuevoIngrediente: Ingrediente = {} as Ingrediente;
  tiposIngrediente: string[] = [];
  constructor(private ingredienteService: IngredienteService) {}

  ngOnInit(){
    this.tiposIngrediente = this.ingredienteService.getTiposIngrediente();
  }

   anyadirIngrediente() {
    if (this.nuevoIngrediente.cantidad < 0) {
      alert('La cantidad no puede ser negativa');
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
