import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historial-bienes',
  standalone: false,
  templateUrl: './historial-bienes.component.html',
  styleUrls: ['./historial-bienes.component.scss']
})
export class HistorialBienesComponent implements OnInit {
  currentUser: string = 'Administrador';
  historial: any[] = [];
  loading = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const roleId = user.idRol;
      if (roleId === 2) {
        this.currentUser = 'Coordinador';
      } else if (roleId === 1) {
        this.currentUser = 'Administrador';
      } else {
        this.currentUser = user.nombre || 'Usuario';
      }
    }

    this.loadHistorial();
  }

  loadHistorial(): void {
    this.loading = true;
    this.apiService.getHistorialBienes().subscribe({
      next: (data: any[]) => {
        this.historial = Array.isArray(data)
          ? data
          : (data as any)?.content || (data as any)?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el historial de bienes.', 'error');
      }
    });
  }

  getOrigenLabel(origen: string | null | undefined): string {
    switch (String(origen || '').toUpperCase()) {
      case 'COMPRADO':
        return 'Comprado';
      case 'DONACION':
        return 'Donación';
      case 'TRANSFERENCIA_GRATUITA':
        return 'Transferencia gratuita';
      default:
        return origen ? String(origen) : 'N/A';
    }
  }
}
