import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-usuarios',
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
// Agregar estas propiedades y métodos a tu componente existente

export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioSeleccionado: any;
  mostrarModalEditar: boolean = false; // Nueva propiedad

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.obtenerUsuarios();
    }
  }

  obtenerUsuarios(): void {
    this.authService.listUsers().subscribe(
      data => {
        this.usuarios = data;
        console.log('Usuarios obtenidos:', this.usuarios);
      },
      error => {
        console.error('Error al obtener los usuarios:', error);
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