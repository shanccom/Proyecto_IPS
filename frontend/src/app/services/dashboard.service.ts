import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8000/ventas/boletas/'; 

  constructor(private http: HttpClient, private authService:AuthService) {}

  obtenerGanancia(rango: 'dia' | 'mes' | 'anio'): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}ganancia/?rango=${rango}`, { headers });
  }

}
