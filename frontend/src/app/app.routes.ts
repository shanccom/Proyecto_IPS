import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ComprobanteComponent } from './comprobante/comprobante.component';
import { VentaComponent } from './venta/venta.component';
import { InventarioComponent } from './inventario/inventario.component'
import { ClientesComponent } from './clientes/clientes.component';
import { ListaVentasComponent } from './lista-ventas/lista-ventas.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'factura', component: ComprobanteComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'venta', component:VentaComponent },
  { path: 'listaVentas', component:ListaVentasComponent },
  { path: '**', redirectTo: 'login' }
];