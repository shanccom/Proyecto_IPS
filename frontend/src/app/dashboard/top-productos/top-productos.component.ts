import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-productos',
  imports: [CommonModule],
  templateUrl: './top-productos.component.html',
  styleUrl: './top-productos.component.css'
})
export class TopProductosComponent implements OnInit {

  productos: any[] = [];

  constructor(private dashboardService: DashboardService , private authService: AuthService) {}

  ngOnInit(): void {

    if (this.authService.isAuthenticated()) {
      this.dashboardService.obtenerProductosDelDia().subscribe({
        next: (data) => {
          //console.log('Dashboard : Datos recibidos del servicio:', data);
          this.productos = data;
        },
        error: (error) => {
          console.error('Error al obtener productos más vendidos:', error);
        }
      });
    }
  }
}