import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, HttpClientModule } from '@angular/common/http'; 
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; 


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    HttpClientModule,
  ],
}).catch((err) => console.error(err));
