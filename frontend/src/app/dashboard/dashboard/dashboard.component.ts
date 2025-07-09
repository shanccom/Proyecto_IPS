import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../stats-card/stats-card.component'
import { RouterModule } from '@angular/router';
import { ChartVentasComponent } from '../chart-ventas/chart-ventas.component';
import { DashboardService } from '../../services/dashboard.service';
import { TopProductosComponent } from '../top-productos/top-productos.component';
import { AuthService } from '../../services/auth.service';
import { VentasPendientesComponent } from '../ventas-pendientes/ventas-pendientes.component';
import { TopClientesComponent } from '../top-clientes/top-clientes.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, RouterModule, ChartVentasComponent, TopProductosComponent, VentasPendientesComponent, TopClientesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  ventasSemana = 0;
  ventasMes = 0;
  gananciaDia = 0;
  fechaSemana = '';
  fechaMes = '';
  fechaDia = '';

  constructor(private dashboardService: DashboardService , private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.dashboardService.obtenerResumenDashboard().subscribe({
        next: (resumen) => {
          console.log('Dashboard : Datos recibidos del servicio:', resumen);
          this.ventasSemana = resumen.ventas_semana;
          this.ventasMes = resumen.ventas_mes;
          this.gananciaDia = resumen.ganancia_dia;
          this.fechaSemana = resumen.fecha_semana;
          this.fechaMes = resumen.fecha_mes;
          this.fechaDia = resumen.fecha_dia;
        },
        error: (error) => {
          console.error('Error al obtener resumen del dashboard:', error);
        }
      });
    }
    
  }
}