import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { SessionTimerService } from './session-timer.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: Usuario | null = null;
  private rolesMap: Map<number, string> = new Map([
    [1, 'Admin'],
    [2, 'Coordinador'],
    [3, 'Docente'],
    [4, 'Usuario']
  ]);
  private logoutChannel = new BroadcastChannel('auth_logout_channel');
  
  private redirectByRole(roleId: number): void {
  switch (roleId) {
    case 1:
      this.router.navigate(['/admin']);
      break;
    case 2:
      this.router.navigate(['/coordinador']);
      break;
    case 3:
      this.router.navigate(['/docente']);
      break;
    default:
      this.router.navigate(['/usuario']);
      break;
  }
}

  constructor(
    private router: Router,
    private apiService: ApiService,
    private ngZone: NgZone,
    private sessionTimerService: SessionTimerService
  ) {
    // Escuchar mensajes de cierre de sesión de otras ventanas
    this.initLogoutListener();
    
    // No eliminar la sesión al refrescar la página
    // La sesión se mantiene en localStorage
  }

  private initLogoutListener(): void {
    this.logoutChannel.onmessage = (event) => {
      if (event.data.type === 'logout') {
        // Otra ventana cerró sesión, mostrar alerta y cerrar esta también
        this.ngZone.run(() => {
          this.showLogoutAlert();
        });
      }
    };
  }

  private showLogoutAlert(): void {
    // Mostrar alerta informativa antes de cerrar
    Swal.fire({
      title: 'Sesión cerrada',
      text: 'Su sesión ha sido cerrada desde otra ventana. Será redirigido al inicio de sesión.',
      icon: 'info',
      confirmButtonColor: '#0d47a1',
      confirmButtonText: 'Entendido',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-logout-info-popup',
        confirmButton: 'swal-logout-info-confirm'
      }
    }).then(() => {
      this.performLogout(false); // false = no enviar mensaje (evitar loop)
    });
  }

 login(email: string, contraseña: string): Observable<Usuario> {
  return this.apiService.post<any>('auth/login', {
    email: email,
    password: contraseña
  }).pipe(
    map(response => {
      console.log('Respuesta del backend:', response);
      
      // El backend puede devolver diferentes estructuras, intentamos varias opciones
      const emailResponse = response.email || response.emailUsuario || email;
      const rolResponse = response.rol || response.role || response.idRol;
      const tokenResponse = response.token || response.jwt;
      const nombreResponse = response.nombre || response.nombreUsuario || '';
      const idUsuarioResponse = response.idUsuario || response.id || 0;

      // Mapear el rol correctamente
      let idRol: number;
      if (typeof rolResponse === 'number') {
        idRol = rolResponse;
      } else {
        idRol = this.mapRolToId(rolResponse);
      }

      console.log('Rol recibido del backend:', rolResponse, '→ Mapeado a idRol:', idRol);

      const usuario: Usuario = {
        idUsuario: idUsuarioResponse,
        nombre: nombreResponse,
        email: emailResponse,
        contraseña: '',
        estado: response.estado !== undefined ? response.estado : true,
        fechaRegistro: response.fechaRegistro || new Date().toISOString(),
        idRol: idRol
      };

      console.log('Usuario creado:', usuario);

      this.currentUser = usuario;
      localStorage.setItem('currentUser', JSON.stringify(usuario));
      localStorage.setItem('token', tokenResponse);

      // Iniciar timer de sesión
      this.sessionTimerService.startSession();

      // NO hacemos redirect aquí, lo maneja el componente
      return usuario;
    })
  );
}

private mapRolToId(rol: string | number): number {
  // Si ya es un número, lo devolvemos
  if (typeof rol === 'number') {
    return rol;
  }
  
  // Si es string, lo convertimos a mayúsculas y eliminamos espacios
  const rolUpper = String(rol).toUpperCase().trim();
  
  // Buscar coincidencias parciales también (ej: "Administrador" contiene "ADMIN")
  if (rolUpper.includes('ADMIN') || rolUpper === '1') {
    return 1;
  }
  if (rolUpper.includes('COORDINADOR') || rolUpper === '2') {
    return 2;
  }
  if (rolUpper.includes('DOCENTE') || rolUpper === '3') {
    return 3;
  }
  
  console.warn('Rol no reconocido:', rol, 'usando rol por defecto (Usuario)');
  return 4;
}


  logout(): void {
    // Notificar a otras ventanas que se cerró sesión
    try {
      this.logoutChannel.postMessage({
        type: 'logout',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error enviando mensaje de logout:', error);
    }
    
    // Cerrar sesión en esta ventana
    this.performLogout(false);
  }

  private performLogout(broadcast: boolean = true): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // Detener timer de sesión
    this.sessionTimerService.stopTimer();
    
    // Si debe hacer broadcast y no lo hemos hecho ya
    if (broadcast) {
      try {
        this.logoutChannel.postMessage({
          type: 'logout',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error enviando mensaje de logout:', error);
      }
    }
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Usuario | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getCurrentUserRole(): string {
    const user = this.getCurrentUser();
    if (user) {
      return this.rolesMap.get(user.idRol) || 'Usuario';
    }
    return 'Usuario';
  }

  getCurrentUserRoleId(): number {
    const user = this.getCurrentUser();
    return user ? user.idRol : 4; // Default: Usuario
  }

  isAdmin(): boolean {
    return this.getCurrentUserRoleId() === 1;
  }

  isCoordinador(): boolean {
    return this.getCurrentUserRoleId() === 2;
  }

  isDocente(): boolean {
    return this.getCurrentUserRoleId() === 3;
  }

  isUsuario(): boolean {
    return this.getCurrentUserRoleId() === 4;
  }

  hasAccessToRoute(route: string): boolean {
    const roleId = this.getCurrentUserRoleId();
    
    // Rutas solo para Admin
    const adminOnlyRoutes = ['/usuarios'];
    if (adminOnlyRoutes.includes(route) && roleId !== 1) {
      return false;
    }
    
    // Rutas para Admin y Coordinador
    const adminCoordinadorRoutes = ['/inventario', '/asignacion-aula', '/solicitudes-cambio', '/reportes'];
    if (adminCoordinadorRoutes.includes(route) && (roleId !== 1 && roleId !== 2)) {
      return false;
    }
    
    // Rutas para Docente
    const docenteRoutes = ['/portal-docente', '/mi-aula-asignada', '/reportes-docente'];
    if (docenteRoutes.includes(route) && roleId !== 3) {
      return false;
    }
    
    return true;
  }
  
}
