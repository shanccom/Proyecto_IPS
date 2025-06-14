import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioClienteComponent } from './formulario-cliente/formulario-cliente.component';
import { ClientesService } from '../services/clientes.service';

@Component({
  selector: 'app-clientes',
  imports: [FormularioClienteComponent, FormsModule, CommonModule ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  mostrarFormulario: boolean = false;
  
  constructor( private clientesService: ClientesService){};
  ngOnInit() {
  this.clientesService.getClientes().subscribe(
    data => {
      console.log("Clientes : ",data);
    },
    error => {
      console.error('Error:', error);
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
