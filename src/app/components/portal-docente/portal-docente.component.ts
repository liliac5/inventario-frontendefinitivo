import { Component, OnInit } from '@angular/core';

interface Solicitud {
  aula: string;
  tipo: string;
  detalle: string;
  estado: string;
}

@Component({
  selector: 'app-portal-docente',
  standalone: false,
  templateUrl: './portal-docente.component.html',
  styleUrls: ['./portal-docente.component.scss']
})
export class PortalDocenteComponent implements OnInit {
  currentUser = 'Melanie Cruz';
  
  // Formulario
  aulaSeleccionada: string = '';
  tipoSolicitud: string = '';
  detalleProblema: string = '';
  
  // Opciones
  aulas: string[] = [
    'Seleccione un aula',
    'A-301',
    'B-105',
    'Laboratorio C-202',
    'C-405',
    'A-201',
    'B-302',
    'Lab D-101'
  ];
  
  tiposSolicitud: string[] = [
    'Seleccione el tipo',
    'Mobiliario (sillas, mesas, pizarrón)',
    'Equipamiento (proyector, PCs, red)',
    'Infraestructura (paredes, luz, aire acondicionado)',
    'Otros (Limpieza, seguridad, etc.)'
  ];
  
  // Historial
  solicitudes: Solicitud[] = [
    {
      aula: 'A-301',
      tipo: 'Mobiliario',
      detalle: 'Se requiere reemplazar 5 sillas que tienen las patas rotas y no ofrecen estabilidad.',
      estado: 'Pendiente'
    },
    {
      aula: 'B-105',
      tipo: 'Infraestructura',
      detalle: 'Pizarra acrílica dañada por una grieta en el centro. Necesita reparación urgente.',
      estado: 'Aprobado'
    },
    {
      aula: 'Lab C-202',
      tipo: 'Equipamiento',
      detalle: 'Solicitud de 30 licencias de software de diseño para los estudiantes del laboratorio.',
      estado: 'Rechazado'
    }
  ];

  ngOnInit(): void {
  }

  enviarSolicitud(): void {
    if (this.aulaSeleccionada && this.tipoSolicitud && this.detalleProblema && 
        this.aulaSeleccionada !== 'Seleccione un aula' && 
        this.tipoSolicitud !== 'Seleccione el tipo') {
      
      const nuevaSolicitud: Solicitud = {
        aula: this.aulaSeleccionada,
        tipo: this.tipoSolicitud.split(' (')[0], // Solo el nombre sin la descripción
        detalle: this.detalleProblema,
        estado: 'Pendiente'
      };
      
      this.solicitudes.unshift(nuevaSolicitud);
      
      // Resetear formulario
      this.aulaSeleccionada = '';
      this.tipoSolicitud = '';
      this.detalleProblema = '';
      
      alert('Solicitud enviada exitosamente');
    } else {
      alert('Por favor complete todos los campos');
    }
  }
}

