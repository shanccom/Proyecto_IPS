import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioClienteComponent } from './formulario-cliente/formulario-cliente.component';
import { ClientesService } from '../services/clientes.service';
import { error } from 'console';
import { FormularioRecetaComponent } from '../recetas/formulario-receta/formulario-receta.component';

@Component({
  selector: 'app-clientes',
  imports: [FormularioClienteComponent,FormularioRecetaComponent, FormsModule, CommonModule ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  cliSeleccionado: any; 
  mostrarFormulario: boolean = false;
  clientes: any[] = [];
  mostrarFormularioReceta: boolean = false;
  
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

  //Agregar receta

  abrirAgregarReceta(clicodigo: string){
    this.cliSeleccionado = clicodigo;
    this.mostrarFormularioReceta= true;
    console.log("mostra", this.mostrarFormularioReceta);
    
  }
  cerrarAgregarReceta() {
    this.mostrarFormularioReceta = false;
  }
}
