import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'YAVIRAC - Sistema de Inventario';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Inicializar detección de sesión
    // El SessionService se inicializa automáticamente al inyectarse

    // Escuchar cambios de navegación
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // Si estamos en la ruta raíz o login y hay un usuario autenticado, redirigir según el rol
      if (event.url === '/' || event.url === '/login') {
        const user = this.authService.getCurrentUser();
        const token = localStorage.getItem('token');
        
        if (user && token) {
          const roleId = user.idRol;
          if (roleId === 1 || roleId === 2) {
            this.router.navigate(['/inventario']);
          } else if (roleId === 3) {
            this.router.navigate(['/portal-docente']);
          }
        }
      }
    });
  }
}



