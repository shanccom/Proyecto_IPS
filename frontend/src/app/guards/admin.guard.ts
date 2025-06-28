// guards/admin.guard.ts - Para rutas que requieren permisos de administrador
// guards/auth.guard.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    if (!this.isBrowser) {
      return true;
    }

    const token = this.authService.getToken();
    
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.authService.verifyToken().pipe(
      map((response) => {
        if (response.valid) {
          const user = this.authService.getCurrentUser();

          if (user && (user.is_staff || user.is_superuser)) {
            return true;
          } else {
            console.log('Usuario sin permisos de administrador');
            this.router.navigate(['/dashboard']); // Redirigir a home normal
            return false;
          }
        } else {
          this.authService.clearAuth();
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error verificando permisos:', error);
        this.authService.clearAuth();
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}