import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private baseUrl = 'http://localhost:8000/usuario/'; 

  constructor(private http: HttpClient) { }

  login(usuarioNom: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, {usuarioNom, password });
  }
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}register/`, data);
  }
}
