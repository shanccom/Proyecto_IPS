import { Component, OnInit } from '@angular/core';
import { StatsCardComponent } from '../../dashboard/stats-card/stats-card.component';
import { ChartVentasComponent } from '../../dashboard/chart-ventas/chart-ventas.component';
import { ReportesService } from '../../services/reportes.service';
import { AuthService } from '../../services/auth.service';
import { ChartComprasComponent } from '../../dashboard/chart-compras/chart-compras.component';
import { ProductosVendidosComponent } from '../productos-vendidos/productos-vendidos.component';

@Component({
  selector: 'app-reportes',
  imports: [StatsCardComponent,ChartVentasComponent, ChartComprasComponent ,ProductosVendidosComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  totalVentas = 0;
  totalCompras = 0;

  constructor(private reportesService: ReportesService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
        this.reportesService.obtenerTotales().subscribe({
        next: (res) => {
          this.totalVentas = res.total_ventas;
          this.totalCompras = res.total_compras;
        },
        error: (err) => console.error('Error al obtener totales:', err)
      });
    }

  }
}