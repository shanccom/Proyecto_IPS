import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

    private baseUrl = 'http://localhost:8000/apiCom/comprobantes/';

    constructor(private http: HttpClient, private authService: AuthService) {}

    // Método para crear un comprobante
    crearComprobante(comprobante: any): Observable<any> {
      const headers = this.authService.getAuthHeaders();
      return this.http.post(`${this.baseUrl}`, comprobante, {headers});
    }
}
