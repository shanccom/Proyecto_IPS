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

  /** 
  inicializarGrafico() {
    const canvas = document.getElementById('gananciaChart') as HTMLCanvasElement;
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Ventas Total',
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
    this.dashboardService.obtenerVentas(this.rango).subscribe(
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
  */
  inicializarGrafico() {
    const canvas = document.getElementById('gananciaChart') as HTMLCanvasElement;
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Ventas Total',
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
  this.dashboardService.obtenerVentas(this.rango).subscribe(
    (datosReales) => {
      console.log('Datos reales del backend:', datosReales);
      
      // Completar con datos históricos ficticios
      const datos = this.completarDatosHistoricos(datosReales);
      console.log('Datos completos:', datos);

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

      const maxValor = Math.max(...valores.filter(v => v !== null));
      const margen = 10; 
      const valorMaximoEjeY = Math.ceil((maxValor + margen) / 10) * 10; 

      this.chart.options.scales.y.max = valorMaximoEjeY;

      this.chart.update();
    },
    (error) => {
      console.error('Error al cargar datos de ganancia:', error);
      // En caso de error, usar datos ficticios
      const datosFicticios = this.generarDatosFicticios();
      this.procesarDatosError(datosFicticios);
    }
  );
}
cambiarRangoManual(nuevoRango: 'dia' | 'mes' | 'anio') {
    if (this.rango !== nuevoRango) {
      this.rango = nuevoRango;
      this.cargarDatos();
    }
    
  }

private procesarDatosError(datos: any[]) {
  let campoFecha: 'fecha_dia' | 'fecha_mes' | 'fecha_anio';
  
  if (this.rango === 'dia') campoFecha = 'fecha_dia';
  else if (this.rango === 'mes') campoFecha = 'fecha_mes';
  else campoFecha = 'fecha_anio';

  const etiquetas = datos.map(item => item[campoFecha]);
  const valores = datos.map(item => item.total);

  this.chart.data.labels = etiquetas;
  this.chart.data.datasets[0].data = valores;

  const maxValor = Math.max(...valores);
  const margen = 10; 
  const valorMaximoEjeY = Math.ceil((maxValor + margen) / 10) * 10; 

  this.chart.options.scales.y.max = valorMaximoEjeY;
  this.chart.update();
}

private completarDatosHistoricos(datosReales: any[]): any[] {
  if (datosReales.length === 0) {
    return this.generarDatosFicticios();
  }

  let datosCompletos: any[] = [];

  if (this.rango === 'dia') {
    datosCompletos = this.completarDiasPasados(datosReales);
  } else if (this.rango === 'mes') {
    datosCompletos = this.completarMesesPasados(datosReales);
  } else {
    datosCompletos = this.completarAniosPasados(datosReales);
  }

  return datosCompletos;
}

private completarDiasPasados(datosReales: any[]): any[] {
  const diasCompletos: any[] = [];
  const fechasReales = datosReales.map(item => item.fecha_dia);
  
  const fechaMinima = new Date(Math.min(...fechasReales.map(f => new Date(f).getTime())));
  
  for (let i = 30; i >= 1; i--) {
    const fechaFicticia = new Date(fechaMinima);
    fechaFicticia.setDate(fechaFicticia.getDate() - i);
    
    const fechaStr = fechaFicticia.toISOString().split('T')[0];
    
    if (!fechasReales.includes(fechaStr)) {
      diasCompletos.push({
        fecha_dia: fechaStr,
        total: this.generarValorRealista(datosReales, 'dia'),
        esFicticio: true
      });
    }
  }
  
  diasCompletos.push(...datosReales);
  
  return diasCompletos.sort((a, b) => new Date(a.fecha_dia).getTime() - new Date(b.fecha_dia).getTime());
}

private completarMesesPasados(datosReales: any[]): any[] {
  const mesesCompletos: any[] = [];
  const mesesReales = datosReales.map(item => item.fecha_mes);
  
  const todosMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const fechaActual = new Date();
  for (let i = 11; i >= 0; i--) {
    const fechaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
    const nombreMes = todosMeses[fechaMes.getMonth()];
    
    if (!mesesReales.includes(nombreMes)) {
      mesesCompletos.push({
        fecha_mes: nombreMes,
        total: this.generarValorRealista(datosReales, 'mes'),
        esFicticio: true
      });
    }
  }
  
  mesesCompletos.push(...datosReales);
  
  return mesesCompletos.sort((a, b) => {
    const indexA = todosMeses.indexOf(a.fecha_mes);
    const indexB = todosMeses.indexOf(b.fecha_mes);
    return indexA - indexB;
  });
}

private completarAniosPasados(datosReales: any[]): any[] {
  const aniosCompletos: any[] = [];
  const aniosReales = datosReales.map(item => parseInt(item.fecha_anio));
  
  const anioMinimo = Math.min(...aniosReales);
  
  for (let i = 5; i >= 1; i--) {
    const anioFicticio = anioMinimo - i;
    
    if (!aniosReales.includes(anioFicticio)) {
      aniosCompletos.push({
        fecha_anio: anioFicticio.toString(),
        total: this.generarValorRealista(datosReales, 'anio'),
        esFicticio: true
      });
    }
  }
  
  aniosCompletos.push(...datosReales);
  
  return aniosCompletos.sort((a, b) => parseInt(a.fecha_anio) - parseInt(b.fecha_anio));
}

private generarValorRealista(datosReales: any[], rango: 'dia' | 'mes' | 'anio'): number {
  if (datosReales.length === 0) {
    if (rango === 'dia') return Math.floor(Math.random() * 800) + 100; // 100-900
    if (rango === 'mes') return Math.floor(Math.random() * 8000) + 1000; // 1000-9000
    return Math.floor(Math.random() * 80000) + 10000; // 10000-90000
  }
  
  const valores = datosReales.map(item => item.total);
  const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  
  // Crear más variación en los datos históricos
  const factorReduccionBase = 0.6; // Base más baja
  const variacionReduccion = 0.4; // Variación en el factor de reducción
  const factorReduccion = factorReduccionBase + (Math.random() * variacionReduccion);
  
  const valorBase = promedio * factorReduccion;
  const rangoVariacion = (maximo - minimo) * 0.8; // Aumentar variación al 80%
  
  // Agregar tendencia aleatoria (algunos días mejores, otros peores)
  const tendenciaAleatoria = (Math.random() - 0.5) * rangoVariacion;
  
  const valorFinal = Math.floor(valorBase + tendenciaAleatoria);
  
  // Asegurar que no sea negativo y tenga un mínimo razonable
  const minimoAbsoluto = rango === 'dia' ? 50 : rango === 'mes' ? 500 : 5000;
  return Math.max(valorFinal, minimoAbsoluto);
}

private generarDatosFicticios(): any[] {
  let datos: any[] = [];
  
  if (this.rango === 'dia') {
    // Generar datos para los últimos 14 días con más variación
    const valorBase = 600;
    for (let i = 13; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      
      // Simular patrones realistas: fines de semana más bajos, algunos días picos
      const diaSemana = fecha.getDay(); // 0 = domingo, 6 = sábado
      let multiplicador = 1;
      
      if (diaSemana === 0 || diaSemana === 6) {
        multiplicador = 0.6 + Math.random() * 0.3; // Fines de semana: 60%-90%
      } else if (diaSemana === 5) {
        multiplicador = 0.9 + Math.random() * 0.4; // Viernes: 90%-130%
      } else {
        multiplicador = 0.7 + Math.random() * 0.6; // Otros días: 70%-130%
      }
      
      const valorFinal = Math.floor(valorBase * multiplicador + (Math.random() - 0.5) * 300);
      
      datos.push({
        fecha_dia: fecha.toISOString().split('T')[0],
        total: Math.max(valorFinal, 100), // Mínimo 100
        esFicticio: true
      });
    }
  } else if (this.rango === 'mes') {
    const meses = ['Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
                   'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    const valorBase = 3000;
    
    datos = meses.map((mes, index) => {
      // Simular estacionalidad: diciembre alto, enero-febrero bajos, etc.
      let multiplicadorEstacional = 1;
      
      if (mes === 'Diciembre') multiplicadorEstacional = 1.4; // Navidad
      else if (mes === 'Enero' || mes === 'Febrero') multiplicadorEstacional = 0.7; // Enero/Feb bajos
      else if (mes === 'Noviembre') multiplicadorEstacional = 1.2; // Pre-navidad
      else if (mes === 'Julio' || mes === 'Agosto') multiplicadorEstacional = 1.1; // Vacaciones
      else multiplicadorEstacional = 0.8 + Math.random() * 0.4; // Otros meses
      
      const variacionAleatoria = 0.7 + Math.random() * 0.6; // 70%-130%
      const valorFinal = Math.floor(valorBase * multiplicadorEstacional * variacionAleatoria);
      
      return {
        fecha_mes: mes,
        total: Math.max(valorFinal, 800), // Mínimo 800
        esFicticio: true
      };
    });
  } else {
    const anioActual = new Date().getFullYear();
    const valorBase = 25000;
    
    for (let i = 4; i >= 0; i--) {
      // Simular crecimiento con variaciones
      const factorCrecimiento = Math.pow(1.15, 4 - i); // Crecimiento del 15% anual promedio
      const variacionAleatoria = 0.8 + Math.random() * 0.4; // 80%-120%
      const valorFinal = Math.floor(valorBase * factorCrecimiento * variacionAleatoria);
      
      datos.push({
        fecha_anio: (anioActual - i).toString(),
        total: Math.max(valorFinal, 10000), // Mínimo 10000
        esFicticio: true
      });
    }
  }
  
  return datos;
}

}

