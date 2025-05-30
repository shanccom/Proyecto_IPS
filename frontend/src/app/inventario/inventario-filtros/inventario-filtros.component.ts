import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario-filtros',
  imports: [FormsModule ],
  templateUrl: './inventario-filtros.component.html',
  styleUrl: './inventario-filtros.component.css'
})
export class InventarioFiltrosComponent {
  tipo = '';
  marca = '';
  material = '';
  color = '';
  estado = '';

  @Output() filtrosAplicados = new EventEmitter();
  @Output() reset = new EventEmitter();

  aplicar() {
    this.filtrosAplicados.emit({
      marca: this.marca,
      tipo: this.tipo,
      material: this.material,
      color: this.color,
      estado: this.estado
    });
  }
  limpiarFiltros(){
    this.marca = this.material = this.color = this.estado = '';
    this.reset.emit();
  }
}