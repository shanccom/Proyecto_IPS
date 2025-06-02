import { Component, OnInit } from '@angular/core';
import { RecetaService } from '../services/receta.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioRecetaComponent } from './formulario-receta/formulario-receta.component'; 

@Component({
  selector: 'app-recetas',
  imports: [CommonModule, FormsModule, FormularioRecetaComponent],
  templateUrl: './recetas.component.html',
  styleUrl: './recetas.component.css'
})
export class RecetasComponent implements OnInit{
  recetas: any[] =[];
  mostrarFormulario: boolean = false;
  
  constructor(private recetaService:RecetaService){}

  ngOnInit(): void {
    this.recetaService.getRecetas().subscribe(
      (data) => {
        console.log("Data Recetas: ",data); 
        this.recetas = data;
      },
      (error) => {
        console.error('Error al cargar las recetas', error)
      }
    );

  }
  obtenerRecetas(): void {
    this.recetaService.getRecetas().subscribe(
      (data) => {
        console.log("Recetas obtenidas: ", data); 
        this.recetas = data;  // Asigna las recetas a la variable
      },
      (error) => {
        console.error('Error al cargar las recetas', error);  // Maneja los errores
      }
    );
  }


  abrirFormulario() {
    this.mostrarFormulario = true;
  }
  cerrarFormulario() {
    this.mostrarFormulario = false;
  }
}
