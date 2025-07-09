import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ventas-pendientes',
  imports: [CommonModule],
  templateUrl: './ventas-pendientes.component.html',
  styleUrl: './ventas-pendientes.component.css'
})
export class VentasPendientesComponent implements OnInit {

  pendientes: any[] = [];

  constructor(private dashboardService: DashboardService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.dashboardService.obtenerVentasPendientes().subscribe({
        next: (data) => {
          //console.log('Ventas pendientes:', data);
          this.pendientes = data;
        },
        error: (error) => {
          console.error('Error al obtener ventas pendientes:', error);
        }
      });
    }
  }
}
