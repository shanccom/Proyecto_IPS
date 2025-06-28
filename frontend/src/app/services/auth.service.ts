import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface User {
  id: number;
  usuarioNom: string;
  emplCod?: number;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/usuario/';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Cargar usuario desde localStorage si existe
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (this.isBrowser) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user');
        }
      }
    }
  }

  login(usuarioNom: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}login/`, { usuarioNom, password });
  }

  register(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}register/`, data);
  }

  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseUrl}logout/`, {}, { headers });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}change-password/`, {
      old_password: oldPassword,
      new_password: newPassword
    }, { headers });
  }

  verifyToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}verify-token/`, { headers });
  }

  // Métodos para administración (solo staff) empleados lista
  listUsers(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}admin/users/`, { headers });
  }

  updateUserStatus(userId: number, statusData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}admin/users/${userId}/status/`, statusData, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user?.is_staff || false;
  }

  isSuperUser(): boolean {
    const user = this.getCurrentUser();
    return user?.is_superuser || false;
  }

  isActive(): boolean {
    const user = this.getCurrentUser();
    return user?.is_active || false;
  }

  clearAuth(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  setAuth(token: string, user: User): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}