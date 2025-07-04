import { AfterViewInit, Component, OnInit,Inject, PLATFORM_ID } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import Chart from 'chart.js/auto';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chart-ventas',
  standalone: true,
  templateUrl: './chart-ventas.component.html',
  styleUrls: ['./chart-ventas.component.css'],
})
export class ChartVentasComponent implements AfterViewInit{

  chart: any;
  rango: 'dia' | 'mes' | 'anio' = 'dia';

  constructor(private dashboardService: DashboardService, @Inject(PLATFORM_ID) private platformId: Object) {}


  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.inicializarGrafico();
      this.cargarDatos();
    }
    
  }


  inicializarGrafico() {
    const canvas = document.getElementById('gananciaChart') as HTMLCanvasElement;
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Ganancia Total',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              color: '#000',
              font: {
                size: 14
              }
            }
          }
        },

        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  cargarDatos() {

    
    this.dashboardService.obtenerGanancia(this.rango).subscribe(
      (datos) => {
        console.log('Datos recibidos del backend:', datos);

        // Detecta el nombre correcto de la propiedad según el rango
        let campoFecha: 'fecha_dia' | 'fecha_mes' | 'fecha_anio';

        if (this.rango === 'dia') campoFecha = 'fecha_dia';
        else if (this.rango === 'mes') campoFecha = 'fecha_mes';
        else campoFecha = 'fecha_anio';

        const etiquetasOriginales = datos.map(item => item[campoFecha]);
        const valoresOriginales = datos.map(item => item.total);

        let etiquetas = [...etiquetasOriginales];
        let valores = [...valoresOriginales];

        if (datos.length === 1) {
          etiquetas = [
            ' ', 
            etiquetasOriginales[0], 
            '  ' 
          ];
          valores = [
            null,
            valoresOriginales[0], 
            null 
          ];
        }


        this.chart.data.labels = etiquetas;
        this.chart.data.datasets[0].data = valores;

        const maxValor = Math.max(...valores);
        const margen = 10; 
        const valorMaximoEjeY = Math.ceil((maxValor + margen) / 10) * 10; 

        this.chart.options.scales.y.max = valorMaximoEjeY;

        this.chart.update();
      },
      (error) => {
        console.error('Error al cargar datos de ganancia:', error);
      }
    );
  }


  cambiarRangoManual(nuevoRango: 'dia' | 'mes' | 'anio') {
  if (this.rango !== nuevoRango) {
    this.rango = nuevoRango;
    this.cargarDatos();
  }
}


}


/*    
  cargarDatos() {
    let datos;

    // Declaramos la variable que luego usaremos para acceder al campo correcto
    let campoFecha: 'fecha_dia' | 'fecha_mes' | 'fecha_anio';

    if (this.rango === 'dia') {
      campoFecha = 'fecha_dia';
      datos = [
        { fecha_dia: '2025-07-01', total: 120.50 },
        { fecha_dia: '2025-07-02', total: 95.00 },
        { fecha_dia: '2025-07-03', total: 142.75 },
        { fecha_dia: '2025-07-04', total: 87.20 },
        { fecha_dia: '2025-07-05', total: 130.40 },
      ];
    } else if (this.rango === 'mes') {
      campoFecha = 'fecha_mes';
      datos = [
        { fecha_mes: '2025-01', total: 1800.00 },
        { fecha_mes: '2025-02', total: 1950.20 },
        { fecha_mes: '2025-03', total: 2100.50 },
        { fecha_mes: '2025-04', total: 1750.00 },
        { fecha_mes: '2025-05', total: 2300.75 },
        { fecha_mes: '2025-06', total: 2500.60 },
      ];
    } else {
      campoFecha = 'fecha_anio';
      datos = [
        { fecha_anio: 2021, total: 24000.00 },
        { fecha_anio: 2022, total: 26000.50 },
        { fecha_anio: 2023, total: 28000.30 },
        { fecha_anio: 2024, total: 30000.00 },
        { fecha_anio: 2025, total: 32500.80 },
      ];
    }

    const etiquetasOriginales = datos.map(item => (item as any)[campoFecha]);

    const valoresOriginales = datos.map(item => item.total);

    let etiquetas = [...etiquetasOriginales];
    let valores = [...valoresOriginales];

    if (datos.length === 1) {
      etiquetas = [
        ' ', 
        etiquetasOriginales[0], 
        '  ' 
      ];
      valores = [
        NaN,
        valoresOriginales[0], 
        NaN 
      ];
    }


    this.chart.data.labels = etiquetas;
    this.chart.data.datasets[0].data = valores;

    const maxValor = Math.max(...valores);
    const margen = 10; 
    const valorMaximoEjeY = Math.ceil((maxValor + margen) / 10) * 10; 

    this.chart.options.scales.y.max = valorMaximoEjeY;

    this.chart.update();
  }
*/
