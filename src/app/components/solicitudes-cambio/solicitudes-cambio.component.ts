import { Component, OnInit } from '@angular/core';

interface Solicitud {
  id: number;
  estado: string;
  docente: string;
  aula: string;
  tipo: string;
  descripcion: string;
  fecha: string;
}

@Component({
  selector: 'app-solicitudes-cambio',
  standalone: false,
  templateUrl: './solicitudes-cambio.component.html',
  styleUrls: ['./solicitudes-cambio.component.scss']
})
export class SolicitudesCambioComponent implements OnInit {
  currentUser = 'Ing Edison';
  showDetailModal: boolean = false;
  selectedSolicitud: Solicitud | null = null;
  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmAction: 'aceptar' | 'rechazar' | null = null;
  solicitudToProcess: Solicitud | null = null;

  solicitudes: Solicitud[] = [
    {
      id: 101,
      estado: 'Pendiente',
      docente: 'Prof. Alejandra Soto',
      aula: 'AULA-105',
      tipo: 'Recursos Físicos',
      descripcion: 'Solicita 5 sillas y 1 mesa adicionales para un proyecto de grupo (Temporal).',
      fecha: '25/11/2025'
    },
    {
      id: 102,
      estado: 'Pendiente',
      docente: 'Prof. Javier Reyes',
      aula: 'LAB-301',
      tipo: 'Configuración',
      descripcion: 'Pide cambiar el estado a \'Laboratorio\' y añadir 20 computadoras.',
      fecha: '26/11/2025'
    },
    {
      id: 103,
      estado: 'Pendiente',
      docente: 'Prof. Elena Castro',
      aula: 'AULA-202',
      tipo: 'Recursos Físicos',
      descripcion: 'Solicita la remoción de 2 mesas para liberar espacio para actividades.',
      fecha: '26/11/2025'
    },
    {
      id: 104,
      estado: 'Pendiente',
      docente: 'Prof. Ana Torres',
      aula: 'AULA-101',
      tipo: 'Recursos Físicos',
      descripcion: 'Pide 3 pizarras blancas de mano.',
      fecha: '27/11/2025'
    }
  ];

  filteredSolicitudes: Solicitud[] = [];

  ngOnInit(): void {
    this.filteredSolicitudes = [...this.solicitudes];
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
      this.confirmMessage = `¿Está seguro de aceptar la solicitud #${solicitud.id}?`;
    } else {
      this.confirmMessage = `¿Está seguro de rechazar la solicitud #${solicitud.id}?`;
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

    const index = this.solicitudes.findIndex(s => s.id === this.solicitudToProcess!.id);
    if (index > -1) {
      if (this.confirmAction === 'aceptar') {
        this.solicitudes[index].estado = 'Aceptada';
        this.showSuccessMessage('Solicitud aceptada exitosamente');
      } else {
        this.solicitudes[index].estado = 'Rechazada';
        this.showSuccessMessage('Solicitud rechazada');
      }
      this.filteredSolicitudes = [...this.solicitudes];
      this.closeDetailModal();
      this.closeConfirmModal();
    }
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
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.successMessage = '';
    }, 3000);
  }

  closeSuccessMessage(): void {
    this.showSuccessToast = false;
    this.successMessage = '';
  }
}

