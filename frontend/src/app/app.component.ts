import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(public router: Router) {}

  get showLayout() {
    if (this.router.url == '/login' || this.router.url == '/register'){
      return false;
    }
    return true;
  }
}