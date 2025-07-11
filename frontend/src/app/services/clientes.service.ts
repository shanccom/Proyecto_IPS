import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = 'http://localhost:8000/cliente/'; 

  constructor(private http: HttpClient, private authService:AuthService) {}

  //metodo para crear receta con codigo de cliente
  agregarReceta(receta: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}create_receta/`, receta, {headers});
  }
  //metodo para actualizar receta 
  actualizarReceta(codigo: string, receta: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.baseUrl}update_receta/${codigo}/`, receta, {headers});
  }

  getRecetasCliente(codigoCliente: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}recetas_cliente/?nombre_cliente=${codigoCliente}`, {headers});
  }
  //Clientes
  // Metodo para obtener los clientes
  getClientes(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}obtener_clientes`, {headers});
  }
  agregarCliente(cliente: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}crear_cliente/`, cliente, {headers});
  }
  deleteClient(cliCod: number): Observable<any>{
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<any>(`${this.baseUrl}delete_cliente/${cliCod}/`, {headers});
  }
  updateClient(cliCod: number, cliente: any): Observable<any>{
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.baseUrl}update_cliente/${cliCod}/`, cliente, {headers});
  }


}
