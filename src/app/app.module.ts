import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AsignacionAulaComponent } from './components/asignacion-aula/asignacion-aula.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InventarioComponent,
    UsuariosComponent,
    ReportesComponent,
    SidebarComponent,
    AsignacionAulaComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


