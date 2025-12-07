import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { AsignacionAulaComponent } from './components/asignacion-aula/asignacion-aula.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'asignacion-aula', component: AsignacionAulaComponent },
  { path: '**', redirectTo: '/login' }
];


