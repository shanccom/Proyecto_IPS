import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ProductoResponse {
    id: number;
    codigo: string;
    nombre: string;
    tipo: 'Montura' | 'Luna' | 'Accesorio';
    precio: number;
    stock: number;
    activo: boolean;
}

interface BoletaRequest {
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

interface BoletaResponse {
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
    private apiUrl = 'http://localhost:3000/api'; // CAMBIAR LA URL CUANDO YA ESTE LISTA

    constructor(private http: HttpClient) {}
    
    buscarProductoPorCodigo(codigo: string): Observable<ProductoResponse> {
        return this.http.get<ProductoResponse>(`${this.apiUrl}/productos/${codigo}`);
    }

    crearBoleta(boletaData: BoletaRequest): Observable<BoletaResponse> {
        return this.http.post<BoletaResponse>(`${this.apiUrl}/boletas`, boletaData);
    }

    obtenerBoletas(boletaData: BoletaRequest): Observable<BoletaResponse[]> {
        return this.http.get<BoletaResponse[]>(`${this.apiUrl}/boletas`);
    }

    obtenerSiguienteCorrelativo(serie: string): Observable<{ correlativo: string }> {
        return this.http.get<{ correlativo: string }>(`${this.apiUrl}/boletas/siguiente-correlativo/${serie}`);
    }
}
