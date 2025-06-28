import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private baseUrl = 'http://localhost:8000/productos/'; 


  constructor(private http: HttpClient, private authService: AuthService) { }

  obtenerProductos(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}`,{headers});
  }

  obtenerOpcionesFiltros(tipo: 'montura' | 'accesorio') {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}filter_${tipo}`, {headers});
  }
    
  crearMontura(montura: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.baseUrl}create_montura`, montura, {headers});
  }

  crearLuna(luna: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.baseUrl}lunas`, luna, {headers});
  }

  crearAccesorio(accesorio: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.baseUrl}create_accesorio`, accesorio, {headers});
  }
  
  eliminarMontura(codigo: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.baseUrl}delete_montura?monCod=${codigo}`, {headers});
  }

}
