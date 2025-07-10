import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private baseUrl = 'http://localhost:8000/ventas/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerTotales(): Observable<{ total_ventas: number, total_compras: number }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ total_ventas: number, total_compras: number }>(`${this.baseUrl}boletas/resumen_reportes/`, { headers });
  }
  obtenerComprasPorRango(rango: 'dia' | 'mes' | 'anio'): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}boletas/compras-total/?rango=${rango}`,{ headers }
    );
  }

}
