import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { VentasService } from '../../services/ventas.service';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule], // Agregar FormsModule aquí
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioSeleccionado: any;
  mostrarModalEditar: boolean = false;
  mostrarModalRegistrar: boolean = false; // Nueva propiedad para el modal de registro
  
  // Propiedades para el formulario de registro
  emplCod = "";
  emplNom = "";
  emplCarg = "";
  emplCond = "";

  constructor(private authService: AuthService, private ventasService: VentasService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.obtenerUsuarios();
    }
  }

  obtenerUsuarios(): void {
    this.authService.listUsers().subscribe(
      data => {
        console.log('Respuesta de listUsers:', data);
        
        // Aseguramos que 'usuarios' siempre sea un array
        if (Array.isArray(data)) {
          this.usuarios = data;
        } else if (Array.isArray(data.results)) {
          this.usuarios = data.results;
        } else {
          this.usuarios = []; // Por si acaso
          console.warn('La respuesta no contiene un array válido de usuarios');
        }
      },
      error => {
        console.error('Error al obtener los usuarios:', error);
        this.usuarios = []; // Evitar que quede undefined
      }
    );
  }

  // Método para abrir el modal de edición
  abrirModalEditar(usuario: any): void {
    this.usuarioSeleccionado = { ...usuario }; // Crear una copia para no modificar el original
    this.mostrarModalEditar = true;
  }

  // Método para cerrar el modal de edición
  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.usuarioSeleccionado = null;
  }

  // Método para abrir el modal de registro
  abrirModalRegistrar(): void {
    // Limpiar el formulario
    this.emplCod = "";
    this.emplNom = "";
    this.emplCarg = "";
    this.emplCond = "";
    this.mostrarModalRegistrar = true;
  }

  // Método para cerrar el modal de registro
  cerrarModalRegistrar(): void {
    this.mostrarModalRegistrar = false;
    // Limpiar el formulario
    this.emplCod = "";
    this.emplNom = "";
    this.emplCarg = "";
    this.emplCond = "";
  }

  // Método para registrar empleado (mejorado)
  registrarEmpleado(): void {
    // Validar que todos los campos estén llenos
    if (!this.emplCod.trim() || !this.emplNom.trim() || !this.emplCarg.trim() || !this.emplCond.trim()) {
      alert('Por favor, complete todos los campos');
      return;
    }

    this.ventasService.newColaborator(this.emplCod, this.emplNom, this.emplCarg, this.emplCond).subscribe(
      data => {
        console.log('Empleado registrado exitosamente:', data);
        alert('Empleado registrado exitosamente');
        this.cerrarModalRegistrar(); // Cerrar el modal
        this.obtenerUsuarios(); // Refrescar la lista de usuarios
      },
      error => {
        console.error('Error al registrar empleado:', error);
        alert('Error al registrar empleado. Por favor, inténtelo nuevamente.');
      }
    );
  }

  // Método original mantenido por compatibilidad
  newColaborator(): void {
    this.ventasService.newColaborator(this.emplCod, this.emplNom, this.emplCarg, this.emplCond).subscribe(
      data => {
        console.log('Respuesta...', data);
      },
      error => {
        console.error('Error al obtener los usuarios:', error);
        this.usuarios = []; // Evitar que quede undefined
      }
    );
  }

  editStatusUser(): void {
    const userId = this.usuarioSeleccionado.id;
    const statusData = {
      is_active: this.usuarioSeleccionado.is_active,
      is_staff: this.usuarioSeleccionado.is_staff,
      is_superuser: this.usuarioSeleccionado.is_superuser
    };

    this.authService.updateUserStatus(userId, statusData).subscribe(
      response => {
        console.log('Usuario actualizado:', response.user);
        this.obtenerUsuarios(); // Refrescar la lista
        this.cerrarModalEditar(); // Cerrar el modal
      },
      error => {
        console.error('Error al modificar usuario:', error);
      }
    );
  }

  deleteUser(userId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.authService.deleteUser(userId).subscribe(
        () => {
          console.log('Usuario eliminado exitosamente');
          this.obtenerUsuarios(); // Refrescar la lista
        },
        error => {
          console.error('Error al eliminar usuario:', error);
        }
      );
    }
  }
}