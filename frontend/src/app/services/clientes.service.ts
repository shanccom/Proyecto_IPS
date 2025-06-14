import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = 'http://localhost:8000/cliente/'; 

  constructor(private http: HttpClient) { }

  // Metodo para obtener los clientes
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}obtener_clientes`);
  }
}
