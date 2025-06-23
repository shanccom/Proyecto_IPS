import { Component, OnInit, Input } from '@angular/core';
import { RecetaService } from '../services/receta.service';
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
  
  constructor(private recetaService:RecetaService){}

  ngOnInit(): void {
    console.log('Recetas del cliente en RecetasComponent:', this.recetas);
  }
}
