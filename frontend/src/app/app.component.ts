import { Component , OnInit, PLATFORM_ID, Inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { TemasService } from './services/temas.service';
import { isPlatformBrowser} from '@angular/common';


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
export class AppComponent implements OnInit {
  title = 'frontend';
  isBrowser: boolean;

  constructor(
    public router: Router,
    private temasService: TemasService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const temaGuardado = (localStorage.getItem('tema') as 'light' | 'dark') || 'light';
    const paletaGuardada = (localStorage.getItem('paleta') as any) || 'blue';

    this.temasService.aplicarTema(temaGuardado, paletaGuardada);
  }


  get showLayout() {
    if (this.router.url == '/login' || this.router.url == '/register'){
      return false;
    }
    return true;
  }
}