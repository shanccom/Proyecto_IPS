import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ComprobanteComponent } from './comprobante/comprobante.component';
import { VentaComponent } from './venta/venta.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'factura', component: ComprobanteComponent },
  { path: 'venta', component:VentaComponent },
  { path: '**', redirectTo: 'login' }
];