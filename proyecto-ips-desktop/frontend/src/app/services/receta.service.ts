import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private baseUrl = 'http://localhost:8000/'; 
  constructor(private http: HttpClient){}

  getRecetas():Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}recetas/`);
  }

  crearReceta(receta: any): Observable<any> {
    return this.http.post(`${this.baseUrl}crear-recetas/`,receta);
  }
  

}
