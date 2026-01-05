import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asignacion } from '../../models/asignacion.model';
import { Aula } from '../../models/aula.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mi-aula-asignada',
  standalone: false,
  templateUrl: './mi-aula-asignada.component.html',
  styleUrls: ['./mi-aula-asignada.component.scss']
})
export class MiAulaAsignadaComponent implements OnInit {
  currentUser = '';
  currentUserId: number = 0;
  miAsignacion: Asignacion | null = null;
  miAula: Aula | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre || 'Docente';
      this.currentUserId = user.idUsuario;
      this.loadMiAsignacion();
    } else {
      this.currentUser = 'Docente';
    }
  }

  loadMiAsignacion(): void {
    this.apiService.getAsignaciones().subscribe({
      next: (asignaciones) => {
        this.miAsignacion = asignaciones.find(a => a.id_usuario === this.currentUserId && a.estado) || null;
        if (this.miAsignacion && this.miAsignacion.aula) {
          this.miAula = this.miAsignacion.aula;
        } else if (this.miAsignacion) {
          this.loadAulaDetalle(this.miAsignacion.id_aula);
        }
      },
      error: (error) => {
        console.error('Error cargando asignación:', error);
      }
    });
  }

  loadAulaDetalle(idAula: number): void {
    this.apiService.getAulas().subscribe({
      next: (aulas) => {
        this.miAula = aulas.find(a => a.idAula === idAula) || null;
      },
      error: (error) => {
        console.error('Error cargando aula:', error);
      }
    });
  }

  irAlFormulario(): void {
    this.router.navigate(['/portal-docente']);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES');
  }
}








