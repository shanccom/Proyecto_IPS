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
          if (path.includes('dashboard')) {
            this.pageTitleService.setTitle('Dashboard');
          } else if (path.includes('inventario')) {
            this.pageTitleService.setTitle('Inventario');
          } else if (path.includes('venta')) {
            this.pageTitleService.setTitle('Nueva Venta');
          } else if (path.includes('listaVentas')) {
            this.pageTitleService.setTitle('Lista Ventas');
          } else if (path.includes('clientes')) {
            this.pageTitleService.setTitle('Clientes');
          } else if (path.includes('reportes')) {
            this.pageTitleService.setTitle('Reportes');
          } else if (path.includes('admin-usuarios')) {
            this.pageTitleService.setTitle('Usuarios');
          } else if (path.includes('admin-cuenta')) {
            this.pageTitleService.setTitle('Mi cuenta');
          } else if (path.includes('admin-configuracion')) {
            this.pageTitleService.setTitle('Configuración y Personalización');
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
          this.authService.clearAuth(); // Limpia token y usuario
          this.router.navigate(['/login']); // Redirige al login
        },
        error: (error) => {
          console.error('Error durante logout:', error);
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