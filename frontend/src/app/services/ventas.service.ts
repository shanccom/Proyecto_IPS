import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz unificada para productos
export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    tipo: 'Montura' | 'Luna' | 'Accesorio';
    precio: number;
    stock: number;
    activo?: boolean; // Opcional, por si el backend lo envía
}

export interface BoletaRequest {
    serie: string;
    cliente: {
        tipo_doc: string;
        num_doc: string;
        rzn_social: string;
    };
    items: {
        producto_id: number;
        cantidad: number;
        valor_unitario: number;
    }[];
    subtotal: number;
    igv: number;
    total: number;
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
    hash_sunat?: string;
    url_pdf?: string;
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

    // Buscar producto por código
    buscarProductoPorCodigo(codigo: string): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/productos/buscar?codigo=${codigo}`);
    }

    // Crear una boleta
    crearBoleta(boletaData: BoletaRequest): Observable<BoletaResponse> {
        return this.http.post<BoletaResponse>(`${this.apiUrl}/boletas`, boletaData, this.httpOptions);
    }

    // Obtener todas las boletas
    obtenerBoletas(): Observable<BoletaResponse[]> {
        return this.http.get<BoletaResponse[]>(`${this.apiUrl}/boletas`);
    }

    // Obtener siguiente correlativo
    obtenerSiguienteCorrelativo(serie: string): Observable<{ correlativo: string }> {
        return this.http.get<{ correlativo: string }>(`${this.apiUrl}/boletas/siguiente-correlativo/${serie}`);
    }
}