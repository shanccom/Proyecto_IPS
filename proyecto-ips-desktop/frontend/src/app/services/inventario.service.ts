import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private baseUrl = 'http://localhost:8000/productos/'; 


  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  obtenerOpcionesFiltros(tipo: 'montura' | 'accesorio') {
    return this.http.get<any>(`${this.baseUrl}filter_${tipo}`);
  }
    
  crearMontura(montura: any): Observable<any> {
    return this.http.post(`${this.baseUrl}create_montura`, montura);
  }

  crearLuna(luna: any): Observable<any> {
    return this.http.post(`${this.baseUrl}lunas`, luna);
  }

  crearAccesorio(accesorio: any): Observable<any> {
    return this.http.post(`${this.baseUrl}create_accesorio`, accesorio);
  }
  
  eliminarMontura(codigo: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}delete_montura?monCod=${codigo}`);

  }

}
