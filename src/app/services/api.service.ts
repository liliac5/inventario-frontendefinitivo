import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bien } from '../models/bien.model';
import { Categoria } from '../models/categoria.model';
import { Usuario } from '../models/usuario.model';
import { Rol } from '../models/rol.model';
import { Aula } from '../models/aula.model';
import { Asignacion } from '../models/asignacion.model';
import { Docente } from '../models/docente.model';
import { Solicitud } from '../models/solicitud.model';
import { Notificacion } from '../models/notificacion.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // TODO: Reemplazar con llamadas HTTP reales a la API
  
  // Simulación de datos para desarrollo
  private categorias: Categoria[] = [
    { id_categoria: 1, nombre: 'Equipos de Cómputo' },
    { id_categoria: 2, nombre: 'Mobiliario' },
    { id_categoria: 3, nombre: 'Equipos de Laboratorio' },
    { id_categoria: 4, nombre: 'Equipos Audiovisuales' }
  ];

  private roles: Rol[] = [
    { idRol: 1, nombre: 'Admin' },
    { idRol: 2, nombre: 'Coordinador' },
    { idRol: 3, nombre: 'Docente' },
  ];
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }
private baseUrl = 'http://localhost:8080/api'; // Ajusta si usas otro puerto

  constructor(private http: HttpClient) {}

  // Método POST general
post<T>(endpoint: string, body: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }
  // Método GET general
  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

  // Puedes agregar put y delete si los necesitas
  put<T>(endpoint: string, body: any) {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
 

  // Métodos para Roles
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/roles`, {
      headers: this.getHeaders()
    });
  }

  // Métodos para Usuarios

  getUsuarioById(id: number): Observable<Usuario | null> {
    return of(null).pipe(delay(300));
  }

  // Métodos para Bienes
  

  // ✅ AULAS (ESTE ES EL IMPORTANTE)
  getAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.baseUrl}/aulas`);
  }

 

  // Asignaciones
  getAsignaciones(): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.baseUrl}/asignaciones`);
  }

  createAsignacion(data: { idAula: number; idUsuario: number }) {
  return this.http.post<Asignacion>(
    `${this.baseUrl}/asignaciones`,
    data
  );
}

  updateAsignacion(id: number, body: any) {
  return this.http.put<Asignacion>(
    `${this.baseUrl}/asignaciones/${id}`,
    body
  );
}

  deleteAsignacion(id: number) {
  return this.http.delete(`${this.baseUrl}/asignaciones/${id}`);
}


  // Métodos para Docentes
  getDocentes(): Observable<Docente[]> {
    return of([]).pipe(delay(300));
  }
 // Obtener todas las solicitudes del docente
getSolicitudesDocente(idDocente: number) {
  return this.http.get<Solicitud[]>(`${this.baseUrl}/solicitudes/docente/${idDocente}`);
}


  // Crear nueva solicitud
  createSolicitud(body: any): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.baseUrl}/solicitudes`, body);
  }

  // Métodos para Solicitudes
 getSolicitudes(): Observable<Solicitud[]> {
  return this.http.get<Solicitud[]>(
    `${this.baseUrl}/solicitudes`,
    { headers: this.getHeaders() }
  );
}

   //solicitudes denegar o aprobar
   aprobarSolicitud(id: number) {
  return this.http.put<Solicitud>(
    `${this.baseUrl}/solicitudes/${id}/aprobar`,
    {}
  );
}

denegarSolicitud(id: number) {
  return this.http.put<Solicitud>(
    `${this.baseUrl}/solicitudes/${id}/denegar`,
    {}
  );
}


  
 updateSolicitud(solicitud: Solicitud): Observable<Solicitud> {
  return this.http.put<Solicitud>(
    `${this.baseUrl}/solicitudes/${solicitud.idSolicitud}`,
    {
      estado: solicitud.estado || 'PENDIENTE'
    },
    { headers: this.getHeaders() }
  );
}

  // Métodos para Notificaciones
  getNotificaciones(): Observable<Notificacion[]> {
    return of([]).pipe(delay(300));
  }

  marcarNotificacionLeida(id: number): Observable<boolean> {
    return of(true).pipe(delay(300));
  }
  //USUARIOS
   getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${this.baseUrl}/usuarios`,
      { headers: this.getHeaders() }
    );
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(
      `${this.baseUrl}/usuarios`,
      usuario,
      { headers: this.getHeaders() }
    );
  }

  updateUsuario(id: number, payload: any) {
  return this.http.put<Usuario>(
    `${this.baseUrl}/usuarios/${id}`,
    payload
  );
}

  getBienes(): Observable<Bien[]> {
    return this.http.get<Bien[]>(`${this.baseUrl}/bienes`);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/usuarios/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Métodos para Reportes de Incidencias
  getReportes(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/reportes`,
      { headers: this.getHeaders() }
    );
  }

  getReportesByUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/reportes/usuario/${idUsuario}`,
      { headers: this.getHeaders() }
    );
  }

  createReporte(reporte: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/reportes`,
      reporte,
      { headers: this.getHeaders() }
    );
  }

  updateReporte(id: number, reporte: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/reportes/${id}`,
      reporte,
      { headers: this.getHeaders() }
    );
  }

}
