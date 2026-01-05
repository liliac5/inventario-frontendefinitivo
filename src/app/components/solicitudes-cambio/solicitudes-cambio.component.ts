import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-solicitudes-cambio',
  standalone: false,
  templateUrl: './solicitudes-cambio.component.html',
  styleUrls: ['./solicitudes-cambio.component.scss']
})
export class SolicitudesCambioComponent implements OnInit {
  currentUser: string = 'Administrador';
  showDetailModal: boolean = false;
  selectedSolicitud: Solicitud | null = null;
  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmAction: 'aceptar' | 'rechazar' | null = null;
  solicitudToProcess: Solicitud | null = null;

  solicitudes: Solicitud[] = [];
  filteredSolicitudes: Solicitud[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener usuario y establecer currentUser según el rol
    const user = this.authService.getCurrentUser();
    if (user) {
      const roleId = user.idRol;
      if (roleId === 2) {
        // Coordinador
        this.currentUser = 'Coordinador';
      } else if (roleId === 1) {
        // Admin
        this.currentUser = 'Administrador';
      } else {
        // Otros roles
        this.currentUser = user.nombre || 'Usuario';
      }
    }
    
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.apiService.getSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        this.filteredSolicitudes = [...solicitudes];
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
      }
    });
  }

  viewDetails(solicitud: Solicitud): void {
    this.selectedSolicitud = solicitud;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedSolicitud = null;
  }

  openConfirmModal(solicitud: Solicitud, action: 'aceptar' | 'rechazar'): void {
    this.solicitudToProcess = solicitud;
    this.confirmAction = action;
    if (action === 'aceptar') {
      this.confirmMessage = `¿Está seguro de aceptar la solicitud #${solicitud.idSolicitud}?`;
    } else {
      this.confirmMessage = `¿Está seguro de rechazar la solicitud #${solicitud.idSolicitud}?`;
    }
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmMessage = '';
    this.confirmAction = null;
    this.solicitudToProcess = null;
  }

confirmActionExecute(): void {
  if (!this.solicitudToProcess || !this.confirmAction) return;

  const solicitudActualizada: Solicitud = {
    ...this.solicitudToProcess,
    estado: this.confirmAction === 'aceptar' ? 'APROBADA' : 'DENEGADA'
  };

  this.apiService.updateSolicitud(solicitudActualizada).subscribe({
    next: (solicitud) => {
      const index = this.solicitudes.findIndex(s => s.idSolicitud === solicitud.idSolicitud);
      if (index > -1) {
        this.solicitudes[index] = solicitud;
        this.filteredSolicitudes = [...this.solicitudes];

        // Mensaje animado con SweetAlert2
        this.showSuccessMessage(
          this.confirmAction === 'aceptar' 
            ? 'Solicitud aceptada exitosamente' 
            : 'Solicitud rechazada'
        );
      }
      this.closeDetailModal();
      this.closeConfirmModal();
    },
    error: (error) => {
      console.error('Error actualizando solicitud:', error);
      Swal.fire({
        title: '¡Error!',
        text: 'No se pudo procesar la solicitud. Intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
    }
  });
}


  aceptarSolicitud(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'aceptar');
  }

  rechazarSolicitud(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'rechazar');
  }

  aceptarDesdeTabla(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'aceptar');
  }

  rechazarDesdeTabla(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'rechazar');
  }

  showSuccessToast: boolean = false;
  successMessage: string = '';



showSuccessMessage(message: string): void {
  Swal.fire({
    title: '¡Éxito!',
    text: message,
    icon: 'success',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    showClass: { popup: 'animate__animated animate__fadeInDown' },
    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
  });
}

  closeSuccessMessage(): void {
    this.showSuccessToast = false;
    this.successMessage = '';
  }
  accionConAnimacion(solicitud: Solicitud, accion: 'aceptar' | 'rechazar') {
  const esAceptar = accion === 'aceptar';

  Swal.fire({
    title: esAceptar ? '¿Aceptar solicitud?' : '¿Rechazar solicitud?',
    text: `Solicitud #${solicitud.idSolicitud}`,
    icon: esAceptar ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonText: esAceptar ? 'Sí, aceptar' : 'Sí, rechazar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonColor: esAceptar ? '#4caf50' : '#f44336',
    cancelButtonColor: '#9e9e9e',
    showClass: { popup: 'animate__animated animate__zoomIn' },
    hideClass: { popup: 'animate__animated animate__zoomOut' }
  }).then((result) => {
    if (result.isConfirmed) {
      // Llamamos a tus funciones existentes que procesan la solicitud
      if (esAceptar) {
        this.aceptarDesdeTabla(solicitud);
      } else {
        this.rechazarDesdeTabla(solicitud);
      }
    }
  });
}

  
}
