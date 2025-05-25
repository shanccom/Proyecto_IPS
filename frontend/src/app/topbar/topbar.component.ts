import { Component } from '@angular/core';
import { NavigationEnd, Router }from '@angular/router'

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  pageTitle = "";

  constructor(private router: Router){}

  ngOnInit(): void {
    this.actuTitulo();
  }

  actuTitulo(): void {
    this.router.events.subscribe(event =>{
      if (event instanceof NavigationEnd){ //verificar ssi la navegacion ya terminoy la url esta activa
        const path = this.router.url;
        if(path.includes('dashboard')) this.pageTitle = 'Dashboard';
        else if (path.includes('inventario')) this.pageTitle = 'Inventario';
        else if (path.includes('codBarras')) this.pageTitle = 'Códigos de Barras';
        else if (path.includes('ventas')) this.pageTitle = 'Ventas';
        else if (path.includes('histVent')) this.pageTitle = 'Historial de Ventas';
        else if (path.includes('informe')) this.pageTitle = 'Informes';
        else this.pageTitle = '';

      }

    });
  }

}
