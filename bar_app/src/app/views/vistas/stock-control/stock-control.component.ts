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

  ingredienteEditando: Ingrediente = this.ingredientes[0];

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

  guardarCambios() {
    console.log(this.ingredienteEditando)
    if (!this.ingredienteEditando) return;

    this.ingredienteService.update(this.ingredienteEditando.id ,this.ingredienteEditando)
      .subscribe({
        next: () => {
          alert("Ingrediente actualizado correctamente");
          this.ingredienteEditando = this.ingredientes[-1];
          this.cargarIngredientes(); // vuelve a cargar la lista
        },
        error: () => alert("Error al actualizar el ingrediente"),
      });
  }

  cancelarEdicion() {
    this.ingredienteEditando = this.ingredientes[-1];
  }

}
