import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioClienteComponent } from './formulario-cliente/formulario-cliente.component';
import { ClientesService } from '../services/clientes.service';
import { error } from 'console';

@Component({
  selector: 'app-clientes',
  imports: [FormularioClienteComponent, FormsModule, CommonModule ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  mostrarFormulario: boolean = false;
  clientes: any[] = [];
  
  constructor( private clientesService: ClientesService){};
  ngOnInit(): void {
    this.obtenerClientes();
  }
  obtenerClientes(): void {
    this.clientesService.getClientes().subscribe(
      data => {
        this.clientes = data; 
        console.log('Clientes obtenidos:', this.clientes); 
      },
      error => {
        console.error('Error al obtener los clientes:', error);
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
