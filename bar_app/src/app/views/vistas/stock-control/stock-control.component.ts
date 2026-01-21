import { Component, OnInit } from '@angular/core';
import { IngredienteService } from 'src/app/services/ingrediente.service';
import { Ingrediente } from 'src/app/interfaces/ingrediente';

@Component({
  selector: 'app-stock-control',
  templateUrl: './stock-control.component.html',
  styleUrls: ['./stock-control.component.css']
})
export class StockControlComponent implements OnInit {
  ingredientes: Ingrediente[] = [];
  tiposIngrediente: string[] = [];
  ingredienteEditando: Ingrediente | null = null;

  constructor(private ingredienteService: IngredienteService) {}

  ngOnInit() {
    this.cargarIngredientes();
    this.tiposIngrediente = this.ingredienteService.getTiposIngrediente();
  }

  cargarIngredientes() {
    this.ingredienteService.getAll().subscribe(data => {
      this.ingredientes = data;
    });
  }

  editarIngrediente(ingrediente: Ingrediente) {
    this.ingredienteEditando = { ...ingrediente };
  }

  guardarCambios(): void {
    if (this.ingredienteEditando && typeof this.ingredienteEditando.id === 'number') {
      
      this.ingredienteService.update(this.ingredienteEditando.id, this.ingredienteEditando)
        .subscribe({
          next: () => {
            alert("Ingrediente actualizado correctamente");
            this.ingredienteEditando = null; 
            this.cargarIngredientes(); 
          },
          error: () => alert("Error al actualizar el ingrediente"),
        });
        
    } else {
      alert("No hay un ingrediente seleccionado o el ID no es válido.");
    }
  }

  cancelarEdicion() {
    this.ingredienteEditando = null;
  }
}