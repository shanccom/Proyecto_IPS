import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioClienteComponent } from './formulario-cliente/formulario-cliente.component';

@Component({
  selector: 'app-clientes',
  imports: [FormularioClienteComponent, FormsModule, CommonModule ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {
  mostrarFormulario: boolean = false;
  
  abrirFormulario() {
    this.mostrarFormulario = true;
  }
  cerrarFormulario() {
    this.mostrarFormulario = false;
  }
}
