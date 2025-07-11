import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioClienteComponent } from './formulario-cliente/formulario-cliente.component';
import { ClientesService } from '../services/clientes.service';
import { error } from 'console';
import { FormularioRecetaComponent } from '../recetas/formulario-receta/formulario-receta.component';
import { RecetasComponent } from '../recetas/recetas.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-clientes',
  imports: [FormularioClienteComponent,FormularioRecetaComponent, FormsModule, CommonModule, RecetasComponent ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  cliSeleccionado: any; 
  mostrarFormulario: boolean = false;
  clientes: any[] = [];
  recetasCliente: any[] = []; 
  mostrarFormularioReceta: boolean = false;
  mostrarRecetasModal: boolean = false;
  nombreClienteSeleccionado: string = ''; 
  recetaSeleccionadaParaEditar: any = null;
  nombreBuscado: string ='';
  clientesFiltrados: any[] = [];
  mostrarFormularioEditarCliente: boolean = false;
  mostrarModalEliminar: boolean = false;
  clienteEditando: any = {};
  clienteAEliminar: any = null;
  
  
  constructor( private clientesService: ClientesService, private authService: AuthService){};
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.obtenerClientes();
    }
    
  }
  obtenerClientes(): void {
    this.clientesService.getClientes().subscribe(
      data => {
        this.clientes = data; 
        this.clientesFiltrados = data;
        console.log('Clientes obtenidos:', this.clientes); 
      },
      error => {
        console.error('Error al obtener los clientes:', error);
      }
    );
  }

  obtenerRecetas(codigoCliente: string){
    this.clientesService.getRecetasCliente(this.cliSeleccionado).subscribe(
      data => {
        this.recetasCliente = data;
        console.log('Recetas del cliente:', this.recetasCliente);
      },
      error => {
        console.error('Error al obtener las recetas del cliente:', error);
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
    this.recetaSeleccionadaParaEditar = null;
    this.nombreBuscado = ''; 
    this.filtrarClientes();
  }

  abrirVerReceta(clicodigo: string, nombre: string): void {
    this.cliSeleccionado = clicodigo;
    this.nombreClienteSeleccionado = nombre;
    console.log("nmbre");
    console.log(this.nombreClienteSeleccionado);
    this.obtenerRecetas(clicodigo);
    this.mostrarRecetasModal = true;
  }

  // Cerrar modal de recetas
  cerrarVerRecetas(): void {
    this.mostrarRecetasModal = false; 
    this.recetasCliente = [];
  }

  abrirEditarReceta(receta: any): void{
    this.mostrarFormularioReceta= true;
    this.recetaSeleccionadaParaEditar= receta;
    console.log("Editando receta:", receta);
  }

  //filtrar clientes por nombre
  filtrarClientes() {
    const nombre = this.nombreBuscado.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombre_completo.toLowerCase().includes(nombre)
    );
  }
  // Método para abrir el formulario de edición
abrirEditarCliente(cliente: any): void {
  this.clienteEditando = { ...cliente }; // Copia el cliente para editar
  this.mostrarFormularioEditarCliente = true;
}

// Método para cerrar el formulario de edición
cerrarEditarCliente(): void {
  this.mostrarFormularioEditarCliente = false;
  this.clienteEditando = {};
}

// Método para actualizar el cliente
actualizarCliente(): void {
  this.clientesService.updateClient(this.clienteEditando.codigo, this.clienteEditando).subscribe({
    next: (response) => {
      console.log('Cliente actualizado:', response);
      this.obtenerClientes(); // Recargar la lista de clientes
      this.cerrarEditarCliente();
      // Aquí puedes agregar una notificación de éxito
    },
    error: (error) => {
      console.error('Error al actualizar cliente:', error);
      // Aquí puedes agregar una notificación de error
    }
  });
}

// Método para confirmar eliminación
eliminarCliente(codigo: number, nombre: string): void {
  this.clienteAEliminar = { codigo, nombre };
  this.mostrarModalEliminar = true;
}

// Método para cancelar eliminación
cancelarEliminar(): void {
  this.mostrarModalEliminar = false;
  this.clienteAEliminar = null;
}

// Método para confirmar eliminación
confirmarEliminar(): void {
  if (this.clienteAEliminar) {
    this.clientesService.deleteClient(this.clienteAEliminar.codigo).subscribe({
      next: (response) => {
        console.log('Cliente eliminado:', response);
        this.obtenerClientes(); // Recargar la lista de clientes
        this.mostrarModalEliminar = false;
        this.clienteAEliminar = null;
        // Notifiacion de exito
      },
      error: (error) => {
        console.error('Error al eliminar cliente:', error);
        // notificaicon de error
      }
    });
  }
}
  
}
