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
    estado: 'pendiente' | 'enviada' | 'anulada'; 
    url_pdf?: string;
    nombre_cdr?: string;
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

  // Obtener todas las boletas
  obtenerBoletas(): Observable<{boletas: BoletaResponse[], total_boletas: number}> {
      return this.http.get<{boletas: BoletaResponse[], total_boletas: number}>(`${this.apiUrl}/ventas/boletas/lista/`);
  }

  // Obtener siguiente correlativo
  obtenerSiguienteCorrelativo(serie: string): Observable<{ correlativo: string }> {
      return this.http.get<{ correlativo: string }>(`${this.apiUrl}/ventas/boletas/siguiente-correlativo/${serie}/`);
  }

  //NUEVOS MÉTODOS PARA SUNAT
  reenviarBoletaSunat(boletaId: number): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/ventas/boletas/${boletaId}/reenviar-sunat/`, {});
  }

  descargarCDR(boletaId: number): Observable<Blob> {
      return this.http.get(`${this.apiUrl}/ventas/boletas/${boletaId}/descargar-cdr/`, {
          responseType: 'blob'
      });
  }
  


}