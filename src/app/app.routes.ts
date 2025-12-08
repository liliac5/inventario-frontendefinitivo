import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { AsignacionAulaComponent } from './components/asignacion-aula/asignacion-aula.component';
import { SolicitudesCambioComponent } from './components/solicitudes-cambio/solicitudes-cambio.component';
import { PortalDocenteComponent } from './components/portal-docente/portal-docente.component';
import { MiAulaAsignadaComponent } from './components/mi-aula-asignada/mi-aula-asignada.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'asignacion-aula', component: AsignacionAulaComponent },
  { path: 'solicitudes-cambio', component: SolicitudesCambioComponent },
  { path: 'portal-docente', component: PortalDocenteComponent },
  { path: 'mi-aula-asignada', component: MiAulaAsignadaComponent },
  { path: '**', redirectTo: '/login' }
];


