// interceptors/auth.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo agregar token en el navegador
    if (this.isBrowser) {
      const token = this.authService.getToken();
      
      if (token) {
        // Clonar la petición y agregar el header de autorización
        request = request.clone({
          setHeaders: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación
        if (error.status === 401) {
          console.log('Token inválido o expirado, redirigiendo a login');
          
          // Limpiar autenticación y redirigir solo en el navegador
          if (this.isBrowser) {
            this.authService.clearAuth();
            this.router.navigate(['/login']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}

// providers/auth.providers.ts - Para registrar el interceptor
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const authProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
];