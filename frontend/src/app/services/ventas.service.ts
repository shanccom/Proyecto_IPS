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

interface BoletasPendientesResponse {
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
})
export class VentasService {
    private apiUrl = 'http://localhost:3000/api'; // CAMBIAR LA URL CUANDO YA ESTE LISTA

    constructor(private http: HttpClient) {}

    
    buscarProductoPorCodigo(codigo: string): Observable<ProductoResponse> {
        return this.http.get<ProductoResponse>(`${this.apiUrl}/productos/codigo/${codigo}`);
    }

    obtenerProductos(): Observable<ProductoResponse[]> {
        return this.http.get<ProductoResponse[]>(`${this.apiUrl}/productos`);
    }

    
    crearBoleta(boletaData: BoletaRequest): Observable<BoletaResponse> {
        return this.http.post<BoletaResponse>(`${this.apiUrl}/boletas`, boletaData);
    }

    obtenerBoletas(filtros?: {
        fecha_desde?: string;
        fecha_hasta?: string;
        estado?: string;
        serie?: string;
    }): Observable<BoletaResponse[]> {
        let params = '';
        if (filtros) {
            const searchParams = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) searchParams.append(key, value);
            });
            params = searchParams.toString() ? `?${searchParams.toString()}` : '';
        }
        
        return this.http.get<BoletaResponse[]>(`${this.apiUrl}/boletas${params}`);
    }

    obtenerBoletaPorId(id: number): Observable<BoletaResponse> {
        return this.http.get<BoletaResponse>(`${this.apiUrl}/boletas/${id}`);
    }

    obtenerBoletasPendientes(): Observable<BoletasPendientesResponse> {
        return this.http.get<BoletasPendientesResponse>(`${this.apiUrl}/boletas/pendientes/count`);
    }

    enviarBoletaSunat(id: number): Observable<{ success: boolean; message: string; hash?: string }> {
        return this.http.post<any>(`${this.apiUrl}/boletas/${id}/enviar-sunat`, {});
    }

    anularBoleta(id: number, motivo: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<any>(`${this.apiUrl}/boletas/${id}/anular`, { motivo });
    }

    descargarBoletaPdf(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/boletas/${id}/pdf`, {
            responseType: 'blob'
        });
    }
    
    obtenerSiguienteCorrelativo(serie: string): Observable<{ correlativo: string }> {
        return this.http.get<{ correlativo: string }>(`${this.apiUrl}/boletas/siguiente-correlativo/${serie}`);
    }
    
    buscarClientePorDocumento(tipoDoc: string, numDoc: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/clientes/buscar/${tipoDoc}/${numDoc}`);
    }
}