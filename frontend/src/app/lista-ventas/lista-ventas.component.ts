import { Component, OnInit } from '@angular/core';
import { VentasService } from '../services/ventas.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-ventas',
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-ventas.component.html',
  styleUrl: './lista-ventas.component.css'
})

export class ListaVentasComponent implements OnInit{
  boletas: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private boletaService: VentasService, private router: Router) {}

  ngOnInit(): void {
    this.cargarBoletas();
    setTimeout(() => {
      this.verificarDatos();
    }, 2000);
  }

  reenviarSunat(boleta: any): void {
    const mensaje = boleta.estado === 'enviada' 
      ? '¿Está seguro de REenviar esta boleta a SUNAT?' 
      : '¿Está seguro de enviar esta boleta a SUNAT?';
      
    if (confirm(mensaje)) {
      this.boletaService.reenviarBoletaSunat(boleta.id).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          let esExitoso = false;
          
          if (typeof response === 'string') {
            // Si la respuesta es un string, verificar si contiene "exitosamente"
            esExitoso = response.toLowerCase().includes('exitosamente') || 
                       response.toLowerCase().includes('éxito');
          } else if (typeof response === 'object' && response !== null) {
            // Si es un objeto, verificar la propiedad success
            esExitoso = response.success === true;
          }
          
          if (esExitoso) {
            alert('Boleta enviada exitosamente a SUNAT');
            
            boleta.estado = 'enviada';
            
            this.cargarBoletas(); 
          } else {
            const errorMsg = typeof response === 'object' && response.error 
              ? response.error 
              : 'Error desconocido';
            alert('Error al enviar: ' + errorMsg);
          }
        },
        error: (error) => {
          console.error('Error completo:', error);
          alert('Error de conexión: ' + (error.message || 'Error desconocido'));
        }
      });
    }
  }

  cargarBoletas(): void {
    this.loading = true;
    this.boletaService.obtenerBoletas().subscribe({
      next: (data) => {
        console.log('📦 Datos recibidos del servidor:', data);
        this.boletas = data.boletas;
        
        this.boletas.forEach((boleta, index) => {
          console.log(`🧾 Boleta ${index + 1}:`, {
            id: boleta.id,
            serie: boleta.serie,
            correlativo: boleta.correlativo,
            estado: boleta.estado, 
            tipo_estado: typeof boleta.estado,
            nombre_cdr: boleta.nombre_cdr
          });
        });
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar boletas';
        this.loading = false;
        console.error('Error cargando boletas:', err);
      }
    });
  }

  // MÉTODO PARA DESCARGAR CDR
  descargarCDR(boleta: any): void {
    if (!boleta.nombre_cdr) {
      alert('Esta boleta no tiene CDR disponible');
      return;
    }

    this.boletaService.descargarCDR(boleta.id).subscribe({
      next: (blob) => {
        // Crear URL del blob y descargar automáticamente
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = boleta.nombre_cdr || 'cdr.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        alert('Error al descargar CDR: ' + error.message);
        console.error('Error descargar CDR:', error);
      }
    });
  }

  obtenerEstadoSunat(boleta: any): string {
    // El backend retorna 'estado', no 'enviado_sunat'
    if (boleta.estado === 'enviada') {
      return 'Enviada a SUNAT';
    } else if (boleta.estado === 'pendiente') {
      return 'Pendiente SUNAT';
    } else if (boleta.estado === 'anulada') {
      return 'Anulada';
    }
    return 'Estado desconocido';
  }

  puedeReenviar(boleta: any): boolean {
    // Puede reenviar si NO está enviada (pendiente o anulada)
    return boleta.estado !== 'enviada';
  }

  estaEnviada(boleta: any): boolean {
    return boleta.estado === 'enviada';
  }

  tieneCDR(boleta: any): boolean {
    return boleta.estado === 'enviada' && 
            boleta.nombre_cdr && 
            boleta.nombre_cdr.trim() !== '' &&
            boleta.nombre_cdr !== 'undefined';
  }


  verificarDatos(): void {
    console.log('🔍 VERIFICACIÓN DE DATOS DE BOLETAS:');
    console.log('Total boletas:', this.boletas.length);
    
    this.boletas.forEach((boleta, index) => {
      console.log(`Boleta ${index + 1}:`, {
        id: boleta.id,
        serie: boleta.serie,
        correlativo: boleta.correlativo,
        estado: boleta.estado, 
        tipo_estado: typeof boleta.estado,
        nombre_cdr: boleta.nombre_cdr,
        fecha_emision: boleta.fecha_emision,
        total: boleta.total
      });
      
    });
  }
}