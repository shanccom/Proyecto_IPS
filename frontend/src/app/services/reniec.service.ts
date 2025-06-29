import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PersonaReniec {
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto?: string;
}

interface ApisNetPeResponse {
    success?: boolean;
    data?: any;
    message?: string;
    error?: string;
    nombre?: string;
    nombres?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    numero?: string;
    numeroDocumento?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReniecService {
    private readonly PROXY_URL = '/api/proxy';
    
    constructor(private http: HttpClient) {}

    /**
     * Consulta DNI usando apis.net.pe
     */
    consultarDni(dni: string): Observable<PersonaReniec> {
        if (!this.validarDni(dni)) {
            return throwError(() => new Error('DNI inválido. Debe tener 8 dígitos.'));
        }

        const url = `${this.PROXY_URL}/dni?numero=${dni}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });

        return this.http.get<ApisNetPeResponse>(url, { headers }).pipe(
            map(response => {
                // Respuesta con estructura success/data
                if (response.success === true && response.data) {
                    return this.procesarData(response.data, dni);
                }
                
                // Respuesta directa con los campos o sin success explícito
                if (response.nombre || response.nombres || response.numeroDocumento || response.numero) {
                    return this.procesarData(response, dni);
                }

                // Error explícito
                if (response.success === false || response.error) {
                    throw new Error(response.message || response.error || 'DNI no encontrado en RENIEC');
                }

                throw new Error('DNI no encontrado en RENIEC');
            }),
            catchError(error => {
                if (error.status === 404) {
                    return throwError(() => new Error('DNI no encontrado en la base de datos de RENIEC'));
                } else if (error.status === 429) {
                    return throwError(() => new Error('Límite de consultas alcanzado. Intente más tarde.'));
                } else if (error.status === 0) {
                    return throwError(() => new Error('Error de conexión. Verifique su conexión a internet.'));
                }
                
                return throwError(() => new Error(error.message || 'Error al consultar DNI en RENIEC'));
            })
        );
    }

    /**
     * Procesa los datos de la respuesta
     */
    private procesarData(data: any, dni: string): PersonaReniec {
        // Si tenemos los campos separados
        if (data.nombres && data.apellido_paterno) {
            return {
                dni: data.numeroDocumento || data.numero || dni,
                nombres: data.nombres,
                apellidoPaterno: data.apellido_paterno || '',
                apellidoMaterno: data.apellido_materno || '',
                nombreCompleto: data.nombre_completo || data.nombre || 
                               `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`.trim()
            };
        }
        
        // Si solo tenemos el nombre completo
        const nombreCompleto = data.nombre_completo || data.nombre || '';
        if (nombreCompleto) {
            const partesNombre = this.dividirNombreCompleto(nombreCompleto);
            return {
                dni: data.numeroDocumento || data.numero || dni,
                nombres: partesNombre.nombres,
                apellidoPaterno: partesNombre.apellidoPaterno,
                apellidoMaterno: partesNombre.apellidoMaterno,
                nombreCompleto: nombreCompleto
            };
        }

        throw new Error('No se pudo extraer información válida de la respuesta');
    }

    /**
     * Divide el nombre completo en partes
     */
    private dividirNombreCompleto(nombreCompleto: string): {
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
    } {
        const partes = nombreCompleto.trim().split(' ');
        
        if (partes.length >= 3) {
            return {
                apellidoPaterno: partes[0],
                apellidoMaterno: partes[1],
                nombres: partes.slice(2).join(' ')
            };
        } else if (partes.length === 2) {
            return {
                apellidoPaterno: partes[0],
                apellidoMaterno: '',
                nombres: partes[1]
            };
        } else {
            return {
                apellidoPaterno: '',
                apellidoMaterno: '',
                nombres: nombreCompleto
            };
        }
    }

    private validarDni(dni: string): boolean {
        return /^\d{8}$/.test(dni);
    }
}