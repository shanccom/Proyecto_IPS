import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

    private apiUrl = 'http://localhost:8000/apiCom/comprobantes/';

    constructor(private http: HttpClient) {}

    // Método para crear un comprobante
    crearComprobante(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }
}
