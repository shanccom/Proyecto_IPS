import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../stats-card/stats-card.component'
import { RouterModule } from '@angular/router';
import { ChartVentasComponent } from '../chart-ventas/chart-ventas.component';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, RouterModule, ChartVentasComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  ventasSemana = 0;
  ventasMes = 0;
  gananciaDia = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.obtenerResumenDashboard().subscribe({
      next: (resumen) => {
        this.ventasSemana = resumen.ventas_semana;
        this.ventasMes = resumen.ventas_mes;
        this.gananciaDia = resumen.ganancia_dia;
      },
      error: (error) => {
        console.error('Error al obtener resumen del dashboard:', error);
      }
    });
  }
}