import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AsignacionAulaComponent } from './components/asignacion-aula/asignacion-aula.component';
import { SolicitudesCambioComponent } from './components/solicitudes-cambio/solicitudes-cambio.component';
import { PortalDocenteComponent } from './components/portal-docente/portal-docente.component';
import { MiAulaAsignadaComponent } from './components/mi-aula-asignada/mi-aula-asignada.component';
import { ReportesDocenteComponent } from './components/reportes-docente/reportes-docente.component';
import { routes } from './app.routes';
import { InventarioComponent } from './components/inventario/inventario.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsuariosComponent,
    ReportesComponent,
    SidebarComponent,
    AsignacionAulaComponent,
    SolicitudesCambioComponent,
    PortalDocenteComponent,
    MiAulaAsignadaComponent,
    ReportesDocenteComponent,
    InventarioComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


