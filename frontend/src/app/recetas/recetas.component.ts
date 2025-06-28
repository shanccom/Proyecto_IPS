import { Component, OnInit, Input , Output, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioRecetaComponent } from './formulario-receta/formulario-receta.component'; 

@Component({
  selector: 'app-recetas',
  imports: [CommonModule, FormsModule],
  templateUrl: './recetas.component.html',
  styleUrl: './recetas.component.css'
})
export class RecetasComponent implements OnInit{
  @Input() recetas: any[] = []; 
  @Output() editarReceta = new EventEmitter<any>();
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  recetasFiltradas: any[] = [];
  

  ngOnInit(): void {
    console.log('Recetas del cliente en RecetasComponent:', this.recetas);
    this.recetasFiltradas = [...this.recetas];
  }
  ngOnChanges(): void {
    this.recetasFiltradas = [...this.recetas];
    this.aplicarFiltroFechas(); 
  }

  onEditar(receta: any) {
    this.editarReceta.emit(receta);
  }

  aplicarFiltroFechas() {
    if (!this.filtroFechaInicio && !this.filtroFechaFin) {
      this.recetasFiltradas = [...this.recetas];
      return;
    }

    this.recetasFiltradas = this.recetas.filter(receta => {
      const fechaReceta = new Date(receta.fecha);
      const desde = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
      const hasta = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;

      return (!desde || fechaReceta >= desde) && (!hasta || fechaReceta <= hasta);
    });
  }

}
