import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showRegister: boolean = true;
  emplCod : number | null = null;
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLoading = false;
  private isBrowser: boolean;

  constructor(
    private router: Router, 
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Verificar si ya hay un token válido solo en el navegador
    if (this.isBrowser) {
      this.checkExistingAuth();
    }
  }
// Método para registrar
  register() {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = {
      emplCod: this.emplCod,
      usuarioNom: this.username, // El backend espera usuarioNom
      password: this.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        //console.log('Registro exitoso:', response);
        
        // Usar el método setAuth del servicio
        this.authService.setAuth(response.token, response.user);
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        //console.error('Error en registro:', error);
        this.isLoading = false;
        
        if (error.status === 400) {
          // Manejar errores de validación específicos
          if (error.error.details) {
            const details = error.error.details;
            if (details.usuarioNom) {
              this.errorMessage = details.usuarioNom[0];
            } else if (details.password) {
              this.errorMessage = details.password[0];
            } else {
              this.errorMessage = error.error.error || 'Datos de registro inválidos';
            }
          } else {
            this.errorMessage = error.error.error || 'Error en el registro';
          }
        } else if (error.status === 500) {
          this.errorMessage = 'Error del servidor. Intente más tarde.';
        } else {
          this.errorMessage = 'Error de conexión. Verifique su internet.';
        }
      }
    });
  }
  private checkExistingAuth() {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) return;
    const token = this.authService.getToken();
    if (token && this.authService.isAuthenticated()) {
      this.authService.verifyToken().subscribe({
        next: (response) => {
          if (response.valid) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          this.authService.clearAuth();
        }
      });
    }
  }
  // Método para alternar visibilidad de contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Método para navegar al login 
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
