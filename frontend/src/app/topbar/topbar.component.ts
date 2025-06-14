import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PageTitleService } from '../services/page-title.service';  // Importar el servicio
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit, OnDestroy {
  pageTitle: string = ''; 

  routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
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

  ngOnDestroy(): void {
    // Desuscribirse para evitar posibles fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}