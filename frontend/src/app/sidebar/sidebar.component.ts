import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DATOS_REGISTRAMEYA } from '../constants/registrame.constants';
import { TemasService } from '../services/temas.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  
  constructor(private router: Router, public temasService: TemasService) {}
  isActive(route: string): boolean {
    return this.router.url === route;
  }
  get isDarkMode(): boolean {
    return this.temasService.isDarkMode;
  }
  datos = DATOS_REGISTRAMEYA;
}
