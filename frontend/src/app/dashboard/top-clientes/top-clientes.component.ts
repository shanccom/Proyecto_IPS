import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-clientes',
  imports: [CommonModule],
  templateUrl: './top-clientes.component.html',
  styleUrl: './top-clientes.component.css'
})
export class TopClientesComponent implements OnInit {
  clientes: any[] = [];

  constructor(private dashboardService: DashboardService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.dashboardService.obtenerTopClientes().subscribe({
        next: (data) => {
          this.clientes = data;
        },
        error: (error) => {
          console.error('Error al obtener clientes frecuentes:', error);
        }
      });
    }
  }
}