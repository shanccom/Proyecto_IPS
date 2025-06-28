import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { PageTitleService } from '../services/page-title.service';  // Importar el servicio
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TopbarComponent implements OnInit, OnDestroy {
  pageTitle: string = ''; 

  routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private pageTitleService: PageTitleService  // Inyectar el servicio
  ) {}

  ngOnInit(): void {
    // Al iniciar, obtener el valor del título desde el servicio
    this.pageTitle = this.pageTitleService.getTitle();
    this.actuTitulo();
  }

  actuTitulo(): void {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = this.router.url;

        // Actualizar el título en el servicio según la ruta
        if (path.includes('Dashboard')) {
          this.pageTitleService.setTitle('Dashboard');
        } else if (path.includes('inventario')) {
          this.pageTitleService.setTitle('Inventario');
        } else if (path.includes('codBarras')) {
          this.pageTitleService.setTitle('Códigos de Barras');
        } else if (path.includes('ventas')) {
          this.pageTitleService.setTitle('Ventas');
        } else if (path.includes('clientes')) {
          this.pageTitleService.setTitle('Clientes');
        } else if (path.includes('informe')) {
          this.pageTitleService.setTitle('Informes');
        } else {
          this.pageTitleService.setTitle('');
        }

        // Actualizar la propiedad local `pageTitle` con el valor del servicio
        this.pageTitle = this.pageTitleService.getTitle();
      }
    });
  }
  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout exitoso:', response);
        this.authService.clearAuth(); // Limpia token y usuario (si tienes este método)
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (error) => {
        console.error('Error durante logout:', error);
        // Podrías mostrar un mensaje opcional al usuario
      }
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar posibles fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}