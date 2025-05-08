import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  
// usuario admin, pasword 1234
  login() {
    if (this.username === 'admin' && this.password === '1234') {
      this.router.navigate(['/dashboard']);
      console.log('Login exitoso');
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    }
  }
}

