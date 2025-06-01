import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private baseUrl = 'http://localhost:8000/'; 


  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}productoslista/`);
  }

  obtenerOpcionesFiltros() {
  return this.http.get<any>(`${this.baseUrl}productoslista/filtros/`);
  }
  
  crearMontura(montura: any): Observable<any> {
    return this.http.post(`${this.baseUrl}monturas/`, montura);
  }

  crearLuna(luna: any): Observable<any> {
    return this.http.post(`${this.baseUrl}lunas/`, luna);
  }

  crearAccesorio(accesorio: any): Observable<any> {
    return this.http.post(`${this.baseUrl}accesorios/`, accesorio);
  }

}
