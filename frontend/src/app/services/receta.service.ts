import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private baseUrl = 'http://localhost:8000/cliente/'; 
  constructor(private http: HttpClient){}


}
