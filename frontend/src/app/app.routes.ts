import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ComprobanteComponent } from './comprobante/comprobante.component';
import { VentaComponent } from './venta/venta.component';
import { InventarioComponent } from './inventario/inventario.component'
import { ClientesComponent } from './clientes/clientes.component';
import { ListaVentasComponent } from './lista-ventas/lista-ventas.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReportesComponent } from './reportes/reportes.component';
import { CuentaComponent } from './admin/cuenta/cuenta.component';
import { UsuariosComponent } from './admin/usuarios/usuarios.component';
import { ConfiguracionComponent } from './admin/configuracion/configuracion.component';
import { ConexionComponent } from './admin/conexion/conexion.component';

//Importación de los guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent , canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'inventario', component: InventarioComponent, canActivate: [AuthGuard]},
  { path: 'factura', component: ComprobanteComponent, canActivate: [AuthGuard]},
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard]},
  { path: 'venta', component:VentaComponent, canActivate: [AuthGuard] },
  { path: 'listaVentas', component:ListaVentasComponent, canActivate: [AuthGuard] },
  { path: 'reportes', component:ReportesComponent, canActivate: [AdminGuard] },
  //Ahora admin
  { path: 'admin-cuenta', component:CuentaComponent, canActivate: [AdminGuard] },
  { path: 'admin-usuarios', component:UsuariosComponent, canActivate: [AdminGuard] },
  { path: 'admin-configuracion', component:ConfiguracionComponent, canActivate: [AdminGuard] },
  { path: 'admin-conexion', component:ConexionComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: 'login' }
];