import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string; 
  precio: number;
  stock: number;
  tipo_producto?: string;
}

export interface BoletaRequest {
  serie: string;
  cliente: {
    tipo_doc: string;
    num_doc: string;
    rzn_social: string;
  };
  items: {
    producto_id?: number; 
    descripcion?: string; 
    cantidad: number;
    valor_unitario: number;
    tipo_producto?: string; 
  }[];
  subtotal: number;
  igv: number;
  total: number;
  enviar_sunat?: boolean; 
}

export interface BoletaResponse {
    id: number;
    serie: string;
    correlativo: string;
    fecha_emision: string;
    cliente: any;
    items: any[];
    subtotal: number;
    igv: number;
    total: number;
    estado: 'pendiente' | 'parcial' | 'pagada' | 'enviada' | 'anulada';
    url_pdf?: string;
    nombre_cdr?: string;

    monto_adelantos?: number;  // Total de adelantos pagados
    saldo_pendiente?: number;  // Saldo que falta pagar
    adelantos?: PagoAdelanto[]; // Lista de adelantos realizados
    esta_pagada_completa?: boolean; // Flag para saber si está pagada completamente
}

export interface PagoAdelanto {
  id?: number;
  boleta_id: number;
  monto: number;
  fecha_pago: string;
  descripcion?: string;
  metodo_pago?: string;
}



@Injectable({
    providedIn: 'root'
})

export class VentasService {
  private apiUrl = 'http://localhost:8000';
  private httpOptions = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json'
      })
  };

  constructor(private http: HttpClient) {}

  buscarProductoPorCodigo(codigo: string): Observable<Producto> {
    return this.http.get<any>(`${this.apiUrl}/productos/buscar?codigo=${codigo}`)
      .pipe(
        map(data => ({
          id: data.codigo || null,
          codigo: data.codigo,
          nombre: data.publico || 'Producto sin nombre',
          precio: parseFloat(data.precio),
          stock: data.stock
        }))
      );
  }
    
  // Crear una boleta
  crearBoleta(boletaData: BoletaRequest): Observable<BoletaResponse> {
      return this.http.post<BoletaResponse>(`${this.apiUrl}/ventas/boletas/`, boletaData, this.httpOptions);
  }
  
  // Eliminar una boleta
  eliminarBoleta(boletaId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/eliminar/`, this.httpOptions);
  }

  // Obtener todas las boletas
  obtenerBoletas(): Observable<{boletas: BoletaResponse[], total_boletas: number}> {
      return this.http.get<{boletas: BoletaResponse[], total_boletas: number}>(`${this.apiUrl}/ventas/boletas/lista/`);
  }

  // Obtener siguiente correlativo
  obtenerSiguienteCorrelativo(serie: string): Observable<{ correlativo: string }> {
      return this.http.get<{ correlativo: string }>(`${this.apiUrl}/ventas/boletas/siguiente-correlativo/${serie}/`);
  }

  //NUEVOS MÉTODOS PARA SUNAT
  enviarBoletaSunat(boletaId: number): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/reenviar-sunat/`, {});
  }

  descargarCDR(boletaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ventas/boletas/${boletaId}/descargar-cdr/`, {
        responseType: 'blob'
    }).pipe(
        catchError(error => {
            console.error('Error al descargar CDR:', error);
            return throwError(error);
        })
    );
  }
  
  /**
   * Registra un adelanto/pago parcial para una boleta
   */
  registrarAdelanto(boletaId: number, monto: number, descripcion?: string, metodoPago?: string): Observable<any> {
    const adelantoData = {
      boleta_id: boletaId,
      monto: monto,
      fecha_pago: new Date().toISOString(),
      descripcion: descripcion || 'Pago parcial',
      metodo_pago: metodoPago || 'efectivo'
    };

    return this.http.post<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/adelantos/`, adelantoData, this.httpOptions);
  }

  /**
   * Obtiene todos los adelantos de una boleta específica
   */
  obtenerAdelantosBoleta(boletaId: number): Observable<PagoAdelanto[]> {
    return this.http.get<PagoAdelanto[]>(`${this.apiUrl}/ventas/boletas/${boletaId}/obtener_adelantos/`)
      .pipe(
        map(adelantos => adelantos.map(adelanto => ({
          ...adelanto,
          monto: parseFloat(adelanto.monto.toString()) 
        })))
      );
  }

  /**
   * Obtiene el estado de pago actual de una boleta
   */
  obtenerEstadoPago(boletaId: number): Observable<{
    total_boleta: number;
    monto_adelantos: number;
    saldo_pendiente: number;
    esta_pagada_completa: boolean;
    estado: string;
  }> {
    return this.http.get<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/estado-pago/`);
  }

  /**
   * Procesa un pago y verifica si debe enviarse automáticamente a SUNAT
   */
  procesarPagoConVerificacion(boletaId: number, montoPago: number, descripcion?: string, metodoPago?: string): Observable<{
    pago_registrado: boolean;
    boleta_completada: boolean;
    enviado_sunat: boolean;
    mensaje: string;
  }> {
    const pagoData = {
      monto: montoPago,
      descripcion: descripcion || 'Pago parcial',
      metodo_pago: metodoPago || 'efectivo'
    };

    return this.http.post<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/procesar-pago/`, pagoData, this.httpOptions);
  }

  /**
   * Elimina un adelanto específico
   */
  eliminarAdelanto(boletaId: number, adelantoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/adelantos/${adelantoId}/`);
  }

  /**
   * Obtiene un resumen de todas las boletas con sus estados de pago
   */
  obtenerResumenPagos(): Observable<{
    boletas_pendientes: number;
    boletas_parciales: number;
    boletas_pagadas: number;
    total_por_cobrar: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/ventas/resumen-pagos/`);
  }

  // Para el comprobante Sunat 
  generarComprobanteSunat(boletaId: number): Observable<{
    boleta: BoletaResponse;
    fecha_envio: string;
    estado_envio: string;
  }> {
    return this.http.get<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/comprobante-sunat/`);
  }

  /* -------------------------Empleados-------------------------------------*/
  newColaborator(emplCod: string, emplNom: string, emplCarg: string, emplCond: string): Observable<any> {
  const payload = {
    emplCod,
    emplNom,
    emplCarg,
    emplCond
  };

  return this.http.post<any>(`${this.apiUrl}/create_empleado/`, payload, this.httpOptions);
}

}