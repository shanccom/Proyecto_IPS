import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';
import { DashboardService } from '../../services/dashboard.service';
import { CurrencyPipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-productos-vendidos',
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './productos-vendidos.component.html',
  styleUrl: './productos-vendidos.component.css'
})
export class ProductosVendidosComponent implements OnInit {
  productosVendidos: any[] = [];

  constructor(private dashboardService: DashboardService,  private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarProductosVendidos();
  }

  cargarProductosVendidos() {
    if (this.authService.isAuthenticated()) {
      this.dashboardService.obtenerTodosProductosVendidos().subscribe({
        next: (data) => {
          //console.log('Dashboard : Datos recibidos del servicio:', data);
          this.productosVendidos = data;
        },
        error: (error) => {
          console.error('Error al obtener productos más vendidos:', error);
        }
      });
    }

  }

  exportarCSV() {
    const encabezados = ['Código', 'Descripción', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Fecha'];
    const filas = this.productosVendidos.map(p => [
      p.codigo,
      p.descripcion,
      p.tipo,
      p.cantidad,
      p.precio,
      p.total,
      p.fecha
    ]);

    const csvContenido = [encabezados, ...filas]
      .map(fila => fila.join(','))
      .join('\n');

    const blob = new Blob([csvContenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'productos_vendidos.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text("Reporte de Productos Vendidos", 14, 14);

    const body = this.productosVendidos.map(p => [
      p.codigo,
      p.descripcion,
      p.tipo,
      p.cantidad,
      p.precio,
      p.total,
      p.fecha
    ]);

    autoTable(doc, {
      head: [['Código', 'Descripción', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Fecha']],
      body: body,
      startY: 20
    });

    doc.save('productos_vendidos.pdf');
  }

}
