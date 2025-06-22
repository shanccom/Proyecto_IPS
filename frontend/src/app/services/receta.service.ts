import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private baseUrl = 'http://localhost:8000/cliente/'; 
  constructor(private http: HttpClient){}

  recetasCliente(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}recetas_cliente/?nombre_cliente=${nombre}`);
  }

  crearReceta(receta: any): Observable<any> {
    return this.http.post(`${this.baseUrl}create_receta`,receta);
  }
  

}
