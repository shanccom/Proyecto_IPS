import { Component, OnInit } from '@angular/core';
import { RecetaService } from '../services/receta.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recetas',
  imports: [FormsModule],
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
        console.log(data); 
        this.recetas = data;
      },
      (error) => {
        console.error('Error al cargar las recetas', error)
      }
    );

  }



  nuevaReceta: any = {
    cliCod: null,
    rectOpt: false,
    recDIPLejos: null,
    recfecha: '',
    // agrega los demás campos necesarios aquí...
  };

  abrirFormulario() {
    this.mostrarFormulario = true;
  }
}
