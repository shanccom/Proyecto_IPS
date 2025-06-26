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
  

  ngOnInit(): void {
    console.log('Recetas del cliente en RecetasComponent:', this.recetas);
  }

  onEditar(receta: any) {
    this.editarReceta.emit(receta);
  }
}
