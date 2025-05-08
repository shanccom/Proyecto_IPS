import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(public router: Router) {}

  get showLayout() {
    return this.router.url !== '/login';
  }
}