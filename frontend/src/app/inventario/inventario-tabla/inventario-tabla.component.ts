import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario-tabla',
  imports: [CommonModule],
  templateUrl: './inventario-tabla.component.html',
  styleUrl: './inventario-tabla.component.css'
})
export class InventarioTablaComponent {
  @Input() productos: any[] = [];
  @Output() editar = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<string>();
  @Input() tipo: 'montura' | 'accesorio' = 'montura';
  //
  @Output() generarCodigoBarras = new EventEmitter<string>();

  onEditar(producto: any) {
    this.editar.emit(producto);
  }

  onEliminar(codigo: string) {
    this.eliminar.emit(codigo);
  }

  // CODIGO DE BARRAS
  mostrarCodigo(producto: any) {
    this.generarCodigoBarras.emit(producto);
  }
}