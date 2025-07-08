import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8000/ventas/'; 

  constructor(private http: HttpClient, private authService:AuthService) {}

  obtenerVentas(rango: 'dia' | 'mes' | 'anio'): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}boletas/ventas/?rango=${rango}`, { headers });
  }

  // Obtener el resumen del dashboard, com ventas y ganancias
  obtenerResumenDashboard(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}resumen_dashboard/`, { headers });
  }
  //Obtener los productos vendidos del dia
  obtenerProductosDelDia(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}productos-recientes/`, { headers });
  }

  obtenerVentasPendientes(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}boletas/pendientes/`, { headers });
  }



}
