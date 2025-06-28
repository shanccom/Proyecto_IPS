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
  }

  // Separé la lógica de carga en un método para poder reutilizarla
  cargarBoletas(): void {
    this.loading = true;
    this.boletaService.obtenerBoletas().subscribe({
      next: (data) => {
        this.boletas = data.boletas;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar boletas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // ✅ NUEVO MÉTODO PARA REENVIAR A SUNAT
  reenviarSunat(boleta: any): void {
    if (confirm('¿Está seguro de reenviar esta boleta a SUNAT?')) {
      this.boletaService.reenviarBoletaSunat(boleta.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Boleta reenviada exitosamente a SUNAT');
            this.cargarBoletas(); // Recargar lista para ver el estado actualizado
          } else {
            alert('Error al reenviar: ' + response.error);
          }
        },
        error: (error) => {
          alert('Error de conexión: ' + error.message);
          console.error('Error reenviar SUNAT:', error);
        }
      });
    }
  }

  // ✅ NUEVO MÉTODO PARA DESCARGAR CDR
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

  // ✅ MÉTODO AUXILIAR PARA MOSTRAR ESTADO SUNAT
  obtenerEstadoSunat(boleta: any): string {
    if (boleta.enviado_sunat) {
      return 'Enviada a SUNAT';
    } else {
      return 'Pendiente SUNAT';
    }
  }

  // ✅ MÉTODO AUXILIAR PARA VERIFICAR SI PUEDE REENVIAR
  puedeReenviar(boleta: any): boolean {
    return !boleta.enviado_sunat;
  }

  // ✅ MÉTODO AUXILIAR PARA VERIFICAR SI TIENE CDR
  tieneCDR(boleta: any): boolean {
    return boleta.enviado_sunat && boleta.nombre_cdr;
  }
}