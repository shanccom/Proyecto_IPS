// guards/auth.guard.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  canActivate(): Observable<boolean> | boolean {
    if (!this.isBrowser) return true;

    const token = this.authService.getToken();
    if (!token) {
      this.router.navigateByUrl('/login');
      return false;
    }

    return this.authService.verifyToken().pipe(
      map(response => {
        return response?.valid ? true : this.redirectToLogin();
      }),
      catchError(() => {
        return of(this.redirectToLogin());
      })
    );
  }

  private redirectToLogin(): boolean {
    this.authService.clearAuth();
    this.router.navigateByUrl('/login');
    return false;
  }
}