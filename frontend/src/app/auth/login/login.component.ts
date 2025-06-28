import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showRegister: boolean = false;
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
      this.checkExistingToken();
    }
  }

  private checkExistingToken() {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) return;

    const token = localStorage.getItem('token');
    if (token && this.authService.isAuthenticated()) {
      // Verificar si el token es válido
      this.authService.verifyToken().subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          // Token inválido, limpiar localStorage
          this.authService.clearAuth();
        }
      });
    }
  }

  login() {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor, ingrese usuario y contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // El AuthService ya maneja la verificación del navegador internamente
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        
        // Usar el método setAuth del servicio
        this.authService.setAuth(response.token, response.user);
        
        // Redireccionar según el tipo de usuario
        if (response.user.is_staff || response.user.is_superuser) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.errorMessage = error.error.error || 'Credenciales inválidas';
        } else if (error.status === 400) {
          this.errorMessage = error.error.error || 'Datos incompletos';
        } else if (error.status === 500) {
          this.errorMessage = 'Error del servidor. Intente más tarde.';
        } else {
          this.errorMessage = 'Error de conexión. Verifique su internet.';
        }
      }
    });
  }

  togglePasswordVisibilidad() {
    this.showPassword = !this.showPassword;
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.clearForm();
  }

  private clearForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this.showPassword = false;
  }
  // Método para navegar al register
  goToRegister() {
    this.router.navigate(['/register']);
  }

  
}