import { Component, OnInit } from '@angular/core';
import { VentasService } from '../services/ventas.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { BoletaResponse, PagoAdelanto } from '../services/ventas.service';
import { FormsModule } from '@angular/forms';
import { GenerarComprobanteSunatService } from '../services/generar-comprobante-sunat.service';

@Component({
  selector: 'app-lista-ventas',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-ventas.component.html',
  styleUrl: './lista-ventas.component.css'
})

export class ListaVentasComponent implements OnInit{
  boletas: any[] = [];
  loading = true;
  error: string | null = null;
  // Variables para el modal de pagos
  mostrarModalPago = false;
  boletaSeleccionada: BoletaResponse | null = null;
  montoPago = 0;
  descripcionPago = '';
  metodoPago = 'efectivo';
  mostrarModalDetalles: boolean = false;
  mostrarModalHistorial = false;
  adelantosHistorial: PagoAdelanto[] = [];
  cargandoHistorial = false;
  mostrarModalComprobante = false;
  datosComprobante: any = null;
  numeroComprobante = '';

  // Modal General
  modalAbierto: string | null = null;

  constructor(private ventasService: VentasService, private router: Router, private comprobanteSunatService: GenerarComprobanteSunatService) {}

  ngOnInit(): void {
    this.cargarBoletas();
  }
  /**
 * ✅ ACTUALIZAR SALDOS PENDIENTES USANDO EL ENDPOINT DE ESTADO-PAGO
 */
private actualizarSaldosPendientes(): void {
  console.log('🔄 Actualizando saldos pendientes...');
  
  this.boletas.forEach(boleta => {
    // Usar el endpoint que ya tienes: estado-pago
    this.ventasService.obtenerEstadoPago(boleta.id).subscribe({
      next: (estado) => {
        // Actualizar la boleta con los datos reales del backend
        boleta.monto_adelantos = estado.monto_adelantos;
        boleta.saldo_pendiente = estado.saldo_pendiente;
        boleta.esta_pagada_completa = estado.esta_pagada_completa;
        
        // Actualizar estado visual según el pago real
        if (estado.esta_pagada_completa) {
          // Si está pagada completa, mantener 'enviada' si ya está enviada, sino 'pagada'
          boleta.estado = boleta.estado === 'enviada' ? 'enviada' : 'pagada';
        } else if (estado.monto_adelantos > 0) {
          // Si tiene adelantos, mantener 'enviada' si ya está enviada, sino 'parcial'
          boleta.estado = boleta.estado === 'enviada' ? 'enviada' : 'parcial';
        }
        // Si no tiene adelantos, mantener el estado original (pendiente/enviada)
        
        console.log(`✅ Boleta ${boleta.serie}-${boleta.correlativo} actualizada:`, {
          total: boleta.total,
          adelantos: boleta.monto_adelantos,
          saldo: boleta.saldo_pendiente,
          estado: boleta.estado,
          pagada_completa: boleta.esta_pagada_completa
        });
      },
      error: (error) => {
        console.error(`❌ Error al obtener estado de boleta ${boleta.id}:`, error);
        
        // Fallback: usar cálculo local si falla el endpoint
        const saldoCalculado = this.calcularSaldoPendiente(boleta);
        boleta.saldo_pendiente = saldoCalculado;
        
        console.log(`⚠️ Usando cálculo local para boleta ${boleta.id}: S/. ${saldoCalculado}`);
      }
    });
  });
} 

  // ✅ SOLUCIÓN FINAL: Actualizar saldos después de cargar boletas
  cargarBoletas(): void {
    console.log('🟣 EJECUTANDO cargarBoletas()');
    this.loading = true;
    this.ventasService.obtenerBoletas().subscribe({
      next: (data) => {
        this.boletas = data.boletas.sort((a, b) => b.id - a.id);
        
        // 🔧 ACTUALIZAR SALDOS REALES DESPUÉS DE CARGAR
        this.actualizarSaldosPendientes();
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar boletas';
        this.loading = false;
        console.error('❌ Error cargando boletas:', err);
      }
    });
  }

  // ✅ MÉTODO AUXILIAR CORREGIDO - Usar campo 'estado' del backend
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

  // ✅ MÉTODO AUXILIAR CORREGIDO para verificar si puede reenviar
  puedeReenviar(boleta: any): boolean {
    // Puede reenviar si NO está enviada (pendiente o anulada)
    return boleta.estado !== 'enviada';
  }

  // ✅ MÉTODO AUXILIAR CORREGIDO para verificar si está enviada
  estaEnviada(boleta: any): boolean {
    return boleta.estado === 'enviada';
  }

  // ✅ MÉTODO AUXILIAR CORREGIDO para verificar si tiene CDR
  tieneCDR(boleta: any): boolean {
    return boleta.estado === 'enviada' && 
            boleta.nombre_cdr && 
            boleta.nombre_cdr.trim() !== '' &&
            boleta.nombre_cdr !== 'undefined';
  }

  //METODOS PARA DESCARGAR
  descargarCDR(boleta: BoletaResponse): void {
  if (!boleta.nombre_cdr) {
    alert('Esta boleta no tiene CDR disponible');
    return;
  }

  this.ventasService.descargarCDR(boleta.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = boleta.nombre_cdr || `CDR_${boleta.serie}_${boleta.correlativo}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    error: (error) => {
      console.error('Error al descargar CDR:', error);
      if (error.status === 404) {
        alert('CDR no encontrado');
      } else if (error.status === 500) {
        alert('Error del servidor al obtener el CDR');
      } else {
        alert('Error al descargar el CDR');
      }
    }
  });
}

/**
 * ✅ MÉTODO PRINCIPAL: Registrar un pago parcial
 */
registrarPago(boleta: BoletaResponse): void {
  this.boletaSeleccionada = boleta;
  this.mostrarModalPago = true;
  
  // Resetear valores
  this.montoPago = 0;
  this.descripcionPago = '';
  this.metodoPago = 'efectivo';
}


/**
 * ✅ MÉTODO PARA PROCESAR EL PAGO CON VERIFICACIÓN AUTOMÁTICA
 */
procesarPago(): void {
  if (!this.boletaSeleccionada || this.montoPago <= 0) {
    alert('Por favor, ingrese un monto válido');
    return;
  }

  const saldoPendiente = this.boletaSeleccionada.total - (this.boletaSeleccionada.monto_adelantos || 0);
  
  if (this.montoPago > saldoPendiente) {
    if (!confirm(`El monto ingresado (S/. ${this.montoPago.toFixed(2)}) es mayor al saldo pendiente (S/. ${saldoPendiente.toFixed(2)}). ¿Desea continuar?`)) {
      return;
    }
  }

  // Usar el método que verifica automáticamente si debe enviarse a SUNAT
  this.ventasService.procesarPagoConVerificacion(
    this.boletaSeleccionada.id,
    this.montoPago,
    this.descripcionPago,
    this.metodoPago
  ).subscribe({
    next: (response) => {
      if (response.pago_registrado) {
        let mensaje = `Pago de S/. ${this.montoPago.toFixed(2)} registrado exitosamente.`;
        
        if (response.boleta_completada) {
          mensaje += '\n✅ ¡Boleta pagada completamente!';
          if (response.enviado_sunat) {
            mensaje += '\n📤 Boleta enviada automáticamente a SUNAT.';
          }
        }
        
        alert(mensaje);

        // 🔧 ACTUALIZAR EL ESTADO LOCAL DE LA BOLETA ANTES DE CERRAR MODAL
        if (this.boletaSeleccionada) {
          const responseAny = response as any;
          
          // 🔧 CORRECCIÓN DE PRECISIÓN: Redondear a 2 decimales
          if (responseAny.saldo_pendiente !== undefined) {
            const nuevoMontoAdelantos = parseFloat((this.boletaSeleccionada.total - responseAny.saldo_pendiente).toFixed(2));
            this.boletaSeleccionada.monto_adelantos = nuevoMontoAdelantos;
          }
          
          // Actualizar el estado si está disponible en la respuesta
          if (responseAny.estado_boleta) {
            this.boletaSeleccionada.estado = responseAny.estado_boleta;
          }
          
          // Si la boleta está completada, marcarla como pagada
          if (response.boleta_completada) {
            this.boletaSeleccionada.estado = 'pagada';
            this.boletaSeleccionada.monto_adelantos = this.boletaSeleccionada.total;
          }
          
          // 🔧 ACTUALIZAR TAMBIÉN EN LA LISTA DE BOLETAS
          const boletaEnLista = this.boletas.find(b => b.id === this.boletaSeleccionada!.id);
          if (boletaEnLista) {
            boletaEnLista.monto_adelantos = this.boletaSeleccionada.monto_adelantos;
            boletaEnLista.estado = this.boletaSeleccionada.estado;
          }
        }

        // Cerrar modal
        this.cerrarModalPago();
        
        // 🔧 SOLO RECARGAR SI ES NECESARIO
        if (response.enviado_sunat || response.boleta_completada) {
          setTimeout(() => {
            this.cargarBoletas();
          }, 500);
        }
        
      } else {
        alert('Error al procesar el pago: ' + response.mensaje);
      }
    },
    error: (error) => {
      console.error('Error al procesar pago:', error);
      alert('Error de conexión al procesar el pago');
    }
  });
}

/**
 * ✅ MÉTODO AUXILIAR MEJORADO para calcular saldo pendiente
 */
calcularSaldoPendiente(boleta: any): number {
  const total = boleta.total || 0;
  const adelantos = boleta.monto_adelantos || 0;
  const saldo = total - adelantos;
  return parseFloat(saldo.toFixed(2)); // Redondear a 2 decimales
}

calcularSaldoPendientesHistorial(): number {
    if (!this.boletaSeleccionada) return 0;
    return this.boletaSeleccionada.total - this.calcularTotalAdelantos();
  }

/**
 * 🔧 MÉTODO PARA OBTENER SALDO PENDIENTE DE LA BOLETA SELECCIONADA
 */
getSaldoPendienteSeleccionada(): number {
  if (!this.boletaSeleccionada) return 0;
  return this.calcularSaldoPendiente(this.boletaSeleccionada);
}

  /**
   * ✅ MÉTODO ALTERNATIVO: Registrar pago simple (sin envío automático)
   */
  registrarPagoSimple(): void {
    if (!this.boletaSeleccionada || this.montoPago <= 0) {
      alert('Por favor, ingrese un monto válido');
      return;
    }

    this.ventasService.registrarAdelanto(
      this.boletaSeleccionada.id,
      this.montoPago,
      this.descripcionPago,
      this.metodoPago
    ).subscribe({
      next: (response) => {
        alert(`Adelanto de S/. ${this.montoPago.toFixed(2)} registrado exitosamente`);
        
        // Verificar si ahora está pagada completamente
        this.verificarEstadoPago(this.boletaSeleccionada!.id);
        
        this.cerrarModalPago();
        this.cargarBoletas();
      },
      error: (error) => {
        console.error('Error al registrar adelanto:', error);
        alert('Error al registrar el adelanto');
      }
    });
  }

  /**
   * ✅ VERIFICAR ESTADO DE PAGO Y ENVIAR AUTOMÁTICAMENTE SI ESTÁ COMPLETA
   */
  verificarEstadoPago(boletaId: number): void {
    this.ventasService.obtenerEstadoPago(boletaId).subscribe({
      next: (estado) => {
        console.log('Estado de pago:', estado);
        
        if (estado.esta_pagada_completa) {
          // Buscar la boleta en el listado local
          const boleta = this.boletas.find(b => b.id === boletaId);
          
          if (boleta && boleta.estado !== 'enviada') {
            const mensaje = `¡Boleta pagada completamente! (S/. ${estado.total_boleta.toFixed(2)})\n¿Desea enviarla automáticamente a SUNAT?`;
            
            if (confirm(mensaje)) {
              this.enviarSunatAutomatico(boleta);
            } else {
              // Solo actualizar el estado a 'pagada'
              boleta.estado = 'pagada';
              boleta.monto_adelantos = estado.monto_adelantos;
              boleta.saldo_pendiente = estado.saldo_pendiente;
              boleta.esta_pagada_completa = true;
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al verificar estado:', error);
      }
    });
  }

  /**
   * ✅ ENVIAR AUTOMÁTICAMENTE A SUNAT (sin confirmación adicional)
   */
  enviarSunatAutomatico(boleta: BoletaResponse): void {
    this.ventasService.enviarBoletaSunat(boleta.id).subscribe({
      next: (response) => {
        console.log('Respuesta del envío automático:', response);
        
        let esExitoso = false;
        
        if (typeof response === 'string') {
          esExitoso = response.toLowerCase().includes('exitosamente') || 
                      response.toLowerCase().includes('éxito');
        } else if (typeof response === 'object' && response !== null) {
          esExitoso = response.success === true;
        }
        
        if (esExitoso) {
          alert('¡Boleta enviada automáticamente a SUNAT tras completar el pago!');
          boleta.estado = 'enviada';
          this.cargarBoletas();
        } else {
          alert('Pago completado, pero hubo un error al enviar a SUNAT. Puede reenviar manualmente.');
          boleta.estado = 'pagada';
        }
      },
      error: (error) => {
        console.error('Error en envío automático:', error);
        alert('Pago completado, pero hubo un error al enviar a SUNAT. Puede reenviar manualmente.');
        boleta.estado = 'pagada';
      }
    });
  }

  /**
   * ✅ MÉTODO ACTUALIZADO PARA ENVÍO MANUAL A SUNAT
   */
  enviarSunat(boleta: BoletaResponse): void {
    // Verificar si está pagada completamente antes de enviar
    if (boleta.estado === 'pendiente' || boleta.estado === 'parcial') {
      const saldoPendiente = boleta.total - (boleta.monto_adelantos || 0);
      
      if (saldoPendiente > 0) {
        if (!confirm(`Esta boleta tiene un saldo pendiente de S/. ${saldoPendiente.toFixed(2)}. ¿Está seguro de enviarla a SUNAT?`)) {
          return;
        }
      }
    }
    
    const mensaje = boleta.estado === 'enviada' 
      ? '¿Está seguro de REenviar esta boleta a SUNAT?' 
      : '¿Está seguro de enviar esta boleta a SUNAT?';
      
    if (confirm(mensaje)) {
      this.ventasService.enviarBoletaSunat(boleta.id).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          let esExitoso = false;
          
          if (typeof response === 'string') {
            esExitoso = response.toLowerCase().includes('exitosamente') || 
                        response.toLowerCase().includes('éxito');
          } else if (typeof response === 'object' && response !== null) {
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

  /**
   * ✅ VER HISTORIAL DE PAGOS - Nueva versión con modal
   */
  verHistorialPagos(boleta: BoletaResponse): void {
    this.boletaSeleccionada = boleta;
    this.mostrarModalHistorial = true;
    this.cargandoHistorial = true;
    
    this.ventasService.obtenerAdelantosBoleta(boleta.id).subscribe({
      next: (adelantos) => {
        this.adelantosHistorial = adelantos;
        this.cargandoHistorial = false;
      },
      error: (error) => {
        console.error('Error al obtener historial:', error);
        this.cargandoHistorial = false;
        // Opcional: mostrar mensaje de error en el modal
      }
    });
  }

  /**
   * Cerrar modal
   */
  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.boletaSeleccionada = null;
    this.adelantosHistorial = [];
  }

  /**
   * Calcular total de adelantos
   */
  calcularTotalAdelantos(): number {
    return this.adelantosHistorial.reduce((total, adelanto) => total + adelanto.monto, 0);
  }

  // Método para mostrar los detalles
    mostrarDetalles(boleta: BoletaResponse): void {
      this.boletaSeleccionada = boleta;
      this.mostrarModalDetalles = true;
    }
    // Método para cerrar el modal
    cerrarModalDetalles(): void {
      this.mostrarModalDetalles = false;
      this.boletaSeleccionada = null;
    }
    /**
   * ✅ CERRAR MODAL DE PAGO
   */
  cerrarModalPago(): void {
    this.mostrarModalPago = false;
    this.boletaSeleccionada = null;
    this.montoPago = 0;
    this.descripcionPago = '';
    this.metodoPago = 'efectivo';
  }

  /**
   * ✅ OBTENER CLASE CSS SEGÚN ESTADO DE PAGO
   */
  obtenerClaseEstado(boleta: BoletaResponse): string {
    const saldoPendiente = boleta.total - (boleta.monto_adelantos || 0);
    
    if (boleta.estado === 'enviada') return 'estado-enviada';
    if (boleta.estado === 'anulada') return 'estado-anulada';
    if (saldoPendiente <= 0) return 'estado-pagada';
    if (boleta.monto_adelantos && boleta.monto_adelantos > 0) return 'estado-parcial';
    return 'estado-pendiente';
  }

  /**
 * ✅ OBTENER TEXTO DEL ESTADO
 */
obtenerTextoEstado(boleta: BoletaResponse): string {
  const saldoPendiente = this.calcularSaldoPendiente(boleta);
  
  if (boleta.estado === 'enviada') return 'Enviada';
  if (boleta.estado === 'anulada') return 'Anulada';
  if (saldoPendiente <= 0) return 'Pagada';
  if (boleta.monto_adelantos && boleta.monto_adelantos > 0) {
    return `Parcial (S/. ${saldoPendiente.toFixed(2)})`;
  }
  return 'Pendiente';
}

/**
 * ✅ MÉTODO PARA OBTENER SALDO PENDIENTE DE UNA BOLETA (para usar en el template)
 */
obtenerSaldoPendiente(boleta: any): number {
  // Si tiene saldo_pendiente calculado, usarlo
  if (boleta.saldo_pendiente !== undefined && boleta.saldo_pendiente !== null) {
    return boleta.saldo_pendiente;
  }
  
  // Si no, calcularlo localmente
  return this.calcularSaldoPendiente(boleta);
}
  eliminarBoleta(boleta: any) {
    // Mostrar confirmación antes de eliminar
    if (confirm(`¿Estás seguro de que deseas eliminar la boleta ${boleta.numero_boleta}?`)) {
      this.ventasService.eliminarBoleta(boleta.id).subscribe({
        next: (response) => {
          // Mostrar mensaje de éxito
          alert('Boleta eliminada correctamente');
          
          // Actualizar la lista de boletas
          this.cargarBoletas();
          
          // O remover directamente del array si no quieres recargar todo
          // this.boletas = this.boletas.filter(b => b.id !== boleta.id);
        },
        error: (error) => {
          console.error('Error al eliminar boleta:', error);
          alert('Error al eliminar');
        }
      });
    }
  }
  /**
   * 🆕 GENERAR COMPROBANTE DE PAGO
   */
  generarComprobante(boleta: BoletaResponse): void {
  this.ventasService.obtenerAdelantosBoleta(boleta.id).subscribe({
    next: (adelantos) => {
      const totalAdelantos = adelantos.reduce((sum, a) => sum + a.monto, 0);
      const saldoPendiente = boleta.total - totalAdelantos;

      this.datosComprobante = {
        numero: `COMP-${boleta.id.toString().padStart(6, '0')}`,
        fecha: new Date().toLocaleDateString('es-PE'),
        hora: new Date().toLocaleTimeString('es-PE'),
        boleta: boleta,
        adelantos: adelantos,
        totalAdelantos: totalAdelantos,
        saldoPendiente: saldoPendiente,
        empresa: {
          nombre: 'Mi Empresa SAC',
          ruc: '20123456789',
          direccion: 'Calle Ejemplo 123',
          telefono: '987654321',
        }
      };

      const html = this.generarHTMLComprobante();
      const ventana = window.open('', '_blank');
      if (ventana) {
        ventana.document.write(html);
        ventana.document.close();
        ventana.print();
      } else {
        alert('No se pudo abrir la ventana para imprimir');
      }
    },
    error: () => alert('No se pudo cargar los adelantos')
  });
}


  /**
   * 🆕 CERRAR MODAL DE COMPROBANTE
   */
  cerrarModalComprobante(): void {
    this.mostrarModalComprobante = false;
    this.datosComprobante = null;
    this.numeroComprobante = '';
  }

  /**
   * 🆕 IMPRIMIR COMPROBANTE
   */
  imprimirComprobante(): void {
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(this.generarHTMLComprobante());
      ventanaImpresion.document.close();
      ventanaImpresion.print();
    }
  }

  /**
   * 🆕 GENERAR HTML PARA IMPRESIÓN
   */
  private generarHTMLComprobante(): string {
    if (!this.datosComprobante) return '';

    const { numero, fecha, hora, boleta, adelantos, totalAdelantos, saldoPendiente, empresa } = this.datosComprobante;

    return `
      <!DOCTYPE html>
<html>
<head>
  <title>Comprobante de Pago - ${numero}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.2;
      width: 80mm;
      margin: 0 auto;
      padding: 5mm;
      color: #000;
    }
    
    .header {
      text-align: center;
      border-bottom: 1px solid #000;
      padding-bottom: 3mm;
      margin-bottom: 3mm;
    }
    
    .empresa {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .datos-empresa {
      font-size: 9px;
      margin-top: 1mm;
    }
    
    .titulo {
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      margin: 3mm 0;
      padding: 2mm;
      background: #f0f0f0;
      border: 1px solid #000;
    }
    
    .info-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1mm;
      font-size: 10px;
    }
    
    .seccion {
      margin: 3mm 0;
      padding: 2mm;
      border: 1px solid #ccc;
      background: #fafafa;
    }
    
    .seccion-titulo {
      font-weight: bold;
      font-size: 10px;
      margin-bottom: 1mm;
      text-transform: uppercase;
    }
    
    .tabla {
      width: 100%;
      border-collapse: collapse;
      margin: 2mm 0;
      font-size: 9px;
    }
    
    .tabla th,
    .tabla td {
      border: 1px solid #000;
      padding: 1mm;
      text-align: left;
    }
    
    .tabla th {
      background: #e0e0e0;
      font-weight: bold;
      text-align: center;
    }
    
    .tabla td.monto {
      text-align: right;
    }
    
    .total-row {
      font-weight: bold;
      background: #f0f0f0;
    }
    
    .saldo-row {
      font-weight: bold;
      background: #ffe0e0;
      color: #d32f2f;
    }
    
    .footer {
      margin-top: 5mm;
      text-align: center;
      font-size: 8px;
      color: #666;
      border-top: 1px dashed #999;
      padding-top: 2mm;
    }
    
    .separador {
      text-align: center;
      margin: 3mm 0;
      font-size: 10px;
    }
    
    .codigo {
      font-size: 8px;
      color: #666;
    }
    
    @media print {
      body {
        width: 58mm;
        font-size: 10px;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="empresa">${empresa.nombre}</div>
    <div class="datos-empresa">
      RUC: ${empresa.ruc}<br>
      ${empresa.direccion}<br>
      Tel: ${empresa.telefono}
    </div>
  </div>

  <div class="titulo">
    COMPROBANTE DE ADELANTO
  </div>

  <div class="info-line">
    <span><strong>N°:</strong> ${numero}</span>
    <span><strong>Fecha:</strong> ${fecha}</span>
  </div>
  
  <div class="info-line">
    <span class="codigo"><strong>Hora:</strong> ${hora}</span>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Cliente</div>
    <div style="font-size: 9px;">
      <strong>${boleta.cliente.rzn_social}</strong><br>
      ${boleta.cliente.tipo_doc}: ${boleta.cliente.num_doc}
    </div>
  </div>

  <div class="seccion">
    <div class="seccion-titulo">Boleta Referencia</div>
    <div class="info-line">
      <span><strong>N°:</strong> ${boleta.serie}-${boleta.correlativo}</span>
      <span><strong>Total:</strong> S/. ${boleta.total.toFixed(2)}</span>
    </div>
    <div class="codigo">
      Fecha: ${new Date(boleta.fecha_emision).toLocaleDateString('es-PE')}
    </div>
  </div>

  <div class="separador">
    ═══════════════════════════════
  </div>

  <table class="tabla">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Método</th>
        <th>Monto</th>
      </tr>
    </thead>
    <tbody>
      ${adelantos.map((adelanto: PagoAdelanto) => `
      <tr>
        <td>${new Date(adelanto.fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}</td>
        <td>${adelanto.metodo_pago || 'Efectivo'}</td>
        <td class="monto">S/. ${adelanto.monto.toFixed(2)}</td>
      </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2"><strong>TOTAL ADELANTOS:</strong></td>
        <td class="monto"><strong>S/. ${totalAdelantos.toFixed(2)}</strong></td>
      </tr>
      <tr class="saldo-row">
        <td colspan="2"><strong>SALDO PENDIENTE:</strong></td>
        <td class="monto"><strong>S/. ${saldoPendiente.toFixed(2)}</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="separador">
    ═══════════════════════════════
  </div>

  <div class="footer">
    <p>Documento interno de control</p>
    <p class="codigo">Generado: ${new Date().toLocaleString('es-PE')}</p>
    <p style="margin-top: 2mm;">¡Gracias por su confianza!</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * 🆕 VERIFICAR SI PUEDE GENERAR COMPROBANTE
   */
  puedeGenerarComprobante(boleta: BoletaResponse): boolean {
  const resultado = boleta.estado == 'pendiente' ||  boleta.estado == 'parcial';
  return resultado;
}

  //NUEVOS METODS PARA UN MEJOR MANEJO DE LAS OPCIONES 
  //Nuevos metodos 
    generarComprobanteSunat(boleta: BoletaResponse): void {
      if (boleta.estado !== 'enviada') {
        alert('Esta boleta aún no ha sido enviada a SUNAT');
        return;
      }

      // Generar el comprobante PDF inmediatamente
      this.comprobanteSunatService.generarComprobanteSunat(boleta);
    }

    enviarSunatConComprobante(boleta: BoletaResponse): void {
      // Verificar si está pagada completamente antes de enviar
      if (boleta.estado === 'pendiente' || boleta.estado === 'parcial') {
        const saldoPendiente = boleta.total - (boleta.monto_adelantos || 0);
        
        if (saldoPendiente > 0) {
          if (!confirm(`Esta boleta tiene un saldo pendiente de S/. ${saldoPendiente.toFixed(2)}. ¿Está seguro de enviarla a SUNAT?`)) {
            return;
          }
        }
      }
      
      const mensaje = boleta.estado === 'enviada' 
        ? '¿Está seguro de REenviar esta boleta a SUNAT?' 
        : '¿Está seguro de enviar esta boleta a SUNAT?';
        
      if (confirm(mensaje)) {
        this.ventasService.enviarBoletaSunat(boleta.id).subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            
            let esExitoso = false;
            
            if (typeof response === 'string') {
              esExitoso = response.toLowerCase().includes('exitosamente') || 
                          response.toLowerCase().includes('éxito');
            } else if (typeof response === 'object' && response !== null) {
              esExitoso = response.success === true;
            }
            
            if (esExitoso) {
              // ✅ PREGUNTAR SI DESEA GENERAR COMPROBANTE
              const generarComprobante = confirm('¡Boleta enviada exitosamente a SUNAT!\n\n¿Desea generar el comprobante de envío?');
              
              boleta.estado = 'enviada';
              this.cargarBoletas();
              
              if (generarComprobante) {
                // Esperar un momento para que se actualice la boleta
                setTimeout(() => {
                  this.generarComprobanteSunat(boleta);
                }, 1000);
              }
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

    enviarSunatAutomaticoConComprobante(boleta: BoletaResponse): void {
      this.ventasService.enviarBoletaSunat(boleta.id).subscribe({
        next: (response) => {
          console.log('Respuesta del envío automático:', response);
          
          let esExitoso = false;
          
          if (typeof response === 'string') {
            esExitoso = response.toLowerCase().includes('exitosamente') || 
                        response.toLowerCase().includes('éxito');
          } else if (typeof response === 'object' && response !== null) {
            esExitoso = response.success === true;
          }
          
          if (esExitoso) {
            // ✅ GENERAR COMPROBANTE AUTOMÁTICAMENTE
            const generarComprobante = confirm('¡Boleta enviada automáticamente a SUNAT tras completar el pago!\n\n¿Desea generar el comprobante de envío?');
            
            boleta.estado = 'enviada';
            this.cargarBoletas();
            
            if (generarComprobante) {
              setTimeout(() => {
                this.generarComprobanteSunat(boleta);
              }, 1000);
            }
          } else {
            alert('Pago completado, pero hubo un error al enviar a SUNAT. Puede reenviar manualmente.');
            boleta.estado = 'pagada';
          }
        },
        error: (error) => {
          console.error('Error en envío automático:', error);
          alert('Pago completado, pero hubo un error al enviar a SUNAT. Puede reenviar manualmente.');
          boleta.estado = 'pagada';
        }
      });
    }

    cerrarModalComprobanteSunat(): void {
      this.mostrarModalComprobante = false;
      this.boletaSeleccionada = null;
    }

    mostrarOpcionesDocumentos(boleta: BoletaResponse): void {
      this.boletaSeleccionada = boleta;
      this.mostrarModalComprobante = true;
    }

    descargarTodosDocumentos(boleta: BoletaResponse): void {
      // Descargar CDR
      if (boleta.nombre_cdr) {
        this.descargarCDR(boleta);
      }
      
      // Generar comprobante
      if (boleta.estado === 'enviada') {
        setTimeout(() => {
          this.generarComprobanteSunat(boleta);
        }, 1000);
      }
      
      alert('Descargando documentos...');
      this.cerrarModalComprobante();
    }
  
  toggleModal(boletaId: string | null): void {
    this.modalAbierto = this.modalAbierto === boletaId ? null : boletaId;
  }
  
}