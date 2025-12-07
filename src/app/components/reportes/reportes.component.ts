import { Component, OnInit } from '@angular/core';

interface Reporte {
  estado: string;
  elementoAfectado: string;
  tipoIncidencia: string;
  reportadoPor: string;
  fechaHora: string;
  detalleProblema: string;
}

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  currentUser = 'Ing Edison';
  selectedFilter: string = 'TODOS';
  showDetailModal: boolean = false;
  selectedReporte: Reporte | null = null;
  
  reportes: Reporte[] = [
    {
      estado: 'En Reparación',
      elementoAfectado: 'Computadora: PC-A101-03',
      tipoIncidencia: 'Avería',
      reportadoPor: 'Prof. López',
      fechaHora: '24/11, 22:00',
      detalleProblema: 'El CPU enciende, pero no da señal al monitor. Es necesaria una revisión de la tarjeta de video o la RAM. Ticket de soporte: T1903.'
    },
    {
      estado: 'Pendiente',
      elementoAfectado: 'Silla N° 5 (Fondo)',
      tipoIncidencia: 'Pérdida/Ausencia',
      reportadoPor: 'Personal Limpieza',
      fechaHora: '24/11, 19:30',
      detalleProblema: 'La silla no está en el aula. Posiblemente tomada por otra aula.'
    },
    {
      estado: 'Resuelto',
      elementoAfectado: 'Proyector Aula 101',
      tipoIncidencia: 'Mantenimiento',
      reportadoPor: 'Administrador',
      fechaHora: '23/11, 10:00',
      detalleProblema: 'Se cambió la lámpara del proyector. Cerrado por Técnico J.'
    }
  ];

  filteredReportes: Reporte[] = [];

  ngOnInit(): void {
    this.applyFilter();
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'TODOS') {
      this.filteredReportes = [...this.reportes];
    } else {
      const estadoMap: { [key: string]: string } = {
        'EN REPARACION': 'En Reparación',
        'PENDIENTE': 'Pendiente',
        'RESUELTOS': 'Resuelto'
      };
      this.filteredReportes = this.reportes.filter(r => 
        r.estado === estadoMap[this.selectedFilter]
      );
    }
  }

  viewDetails(reporte: Reporte): void {
    this.selectedReporte = reporte;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedReporte = null;
  }
}

