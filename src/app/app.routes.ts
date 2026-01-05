import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { AsignacionAulaComponent } from './components/asignacion-aula/asignacion-aula.component';
import { SolicitudesCambioComponent } from './components/solicitudes-cambio/solicitudes-cambio.component';
import { PortalDocenteComponent } from './components/portal-docente/portal-docente.component';
import { MiAulaAsignadaComponent } from './components/mi-aula-asignada/mi-aula-asignada.component';
import { ReportesDocenteComponent } from './components/reportes-docente/reportes-docente.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // Rutas para Admin y Coordinador
  { path: 'inventario', component: InventarioComponent, canActivate: [RoleGuard], data: { role: [1, 2] } },
  { path: 'asignacion-aula', component: AsignacionAulaComponent, canActivate: [RoleGuard], data: { role: [1, 2] } },
  { path: 'solicitudes-cambio', component: SolicitudesCambioComponent, canActivate: [RoleGuard], data: { role: [1, 2] } },
  { path: 'reportes', component: ReportesComponent, canActivate: [RoleGuard], data: { role: [1, 2] } },
  // Rutas solo para Admin
  { path: 'usuarios', component: UsuariosComponent, canActivate: [RoleGuard], data: { role: [1] } },
  // Rutas para Docente
  { path: 'portal-docente', component: PortalDocenteComponent, canActivate: [RoleGuard], data: { role: [3] } },
  { path: 'mi-aula-asignada', component: MiAulaAsignadaComponent, canActivate: [RoleGuard], data: { role: [3] } },
  { path: 'reportes-docente', component: ReportesDocenteComponent, canActivate: [RoleGuard], data: { role: [3] } },
  { path: '**', redirectTo: '/login' }
];


