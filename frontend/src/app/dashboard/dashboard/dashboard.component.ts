import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../stats-card/stats-card.component'
import { RouterModule } from '@angular/router';
import { ChartVentasComponent } from '../chart-ventas/chart-ventas.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, RouterModule, ChartVentasComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  ventasSemana = 120;
  ventasMes = 460;
  gananciaDia = 340.50;

  //luego se le mandaria los valores del backend
}
