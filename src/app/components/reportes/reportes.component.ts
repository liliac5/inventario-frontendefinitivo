import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { BienesService } from '../../services/bienes.service';
import { Bien } from '../../models/bien.model';
import Swal from 'sweetalert2';

interface Reporte {
  idReporte?: number;
  id_reporte?: number;
  estado: string;
  elementoAfectado: string;
  elemento_afectado?: string;
  tipoIncidencia: string;
  tipo_incidencia?: string;
  reportadoPor: string;
  reportado_por?: string;
  fechaHora: string;
  fecha_hora?: string;
  detalleProblema: string;
  detalle_problema?: string;
  idBien?: number;
  id_bien?: number;
  idDocente?: number;
  id_usuario?: number;
}

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  currentUser: string = 'Usuario';
  selectedFilter: string = 'TODOS';
  showDetailModal: boolean = false;
  selectedReporte: Reporte | null = null;
  
  reportes: Reporte[] = [];
  filteredReportes: Reporte[] = [];
  loading: boolean = false;
  bienes: Bien[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private bienesService: BienesService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const role = this.authService.getCurrentUserRole();
      this.currentUser = user.nombre || (role === 'Admin' ? 'Administrador' : role === 'Coordinador' ? 'Coordinador' : 'Usuario');
    }
    this.loadBienes();
    this.loadAllReportes();
  }

  loadBienes(): void {
    this.bienesService.getAll().subscribe({
      next: (bienes) => {
        this.bienes = bienes;
        // Actualizar nombres de bienes en los reportes después de cargar
        this.actualizarNombresBienes();
      },
      error: (error) => {
        console.error('Error cargando bienes:', error);
        this.bienes = [];
      }
    });
  }

  getNombreBien(idBien: number | undefined): string {
    if (!idBien) return 'Sin información';
    
    const bien = this.bienes.find(b => b.idBien === idBien);
    
    if (bien) {
      return bien.nombreBien || `Bien #${idBien}`;
    }
    
    return `Bien #${idBien}`;
  }

  actualizarNombresBienes(): void {
    // Actualizar el nombre del bien en cada reporte
    this.reportes.forEach(reporte => {
      const idBien = reporte.idBien || reporte.id_bien;
      if (idBien && (!reporte.elementoAfectado || reporte.elementoAfectado === 'Cargando...' || reporte.elementoAfectado === 'Sin información')) {
        reporte.elementoAfectado = this.getNombreBien(idBien);
      }
    });
    this.applyFilter();
  }

  loadAllReportes(): void {
    this.loading = true;
    this.reportes = [];
    
    this.apiService.getReportes().subscribe({
      next: (reportesBackend: any[]) => {
        console.log('Reportes recibidos del backend:', reportesBackend);
        
        // Mapear los reportes del backend al formato del componente
        this.reportes = reportesBackend.map((r: any) => {
          const idBien = r.id_bien || r.idBien;
          // Obtener el nombre del bien si ya están cargados, sino usar el que viene del backend o placeholder
          let nombreBien = 'Sin información';
          if (idBien) {
            const bien = this.bienes.find(b => b.idBien === idBien);
            nombreBien = bien ? (bien.nombreBien || `Bien #${idBien}`) : (r.elemento_afectado || r.elementoAfectado || `Bien #${idBien}`);
          } else if (r.elemento_afectado || r.elementoAfectado) {
            nombreBien = r.elemento_afectado || r.elementoAfectado;
          }
          
          // Mapear campos snake_case a camelCase
          const reporte: Reporte = {
            idReporte: r.id_reporte || r.idReporte,
            id_reporte: r.id_reporte || r.idReporte,
            estado: r.estado || 'PENDIENTE',
            elementoAfectado: nombreBien,
            tipoIncidencia: r.tipo_incidencia || r.tipoIncidencia || '',
            tipo_incidencia: r.tipo_incidencia || r.tipoIncidencia || '',
            reportadoPor: r.reportado_por || r.reportadoPor || r.nombre_usuario || 'Docente',
            reportado_por: r.reportado_por || r.reportadoPor || r.nombre_usuario || 'Docente',
            fechaHora: r.fecha_hora || r.fechaHora || new Date().toISOString(),
            fecha_hora: r.fecha_hora || r.fechaHora || new Date().toISOString(),
            detalleProblema: r.detalle_problema || r.detalleProblema || '',
            detalle_problema: r.detalle_problema || r.detalleProblema || '',
            idBien: idBien,
            id_bien: idBien,
            idDocente: r.id_usuario || r.idDocente,
            id_usuario: r.id_usuario || r.idDocente
          };
          
          return reporte;
        });
        
        // Ordenar por fecha/hora más reciente primero
        this.reportes.sort((a, b) => {
          const fechaA = new Date(a.fechaHora || a.fecha_hora || 0).getTime();
          const fechaB = new Date(b.fechaHora || b.fecha_hora || 0).getTime();
          return fechaB - fechaA;
        });
        
        this.loading = false;
        // Si los bienes ya están cargados, actualizar nombres
        if (this.bienes.length > 0) {
          this.actualizarNombresBienes();
        } else {
          this.applyFilter();
        }
      },
      error: (error) => {
        console.error('Error cargando reportes:', error);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los reportes. Por favor, intenta nuevamente.',
          confirmButtonColor: '#0d47a1'
        });
        this.reportes = [];
        this.applyFilter();
      }
    });
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'TODOS') {
      this.filteredReportes = [...this.reportes];
    } else {
      const estadoMap: { [key: string]: string[] } = {
        'EN REPARACION': ['EN REPARACIÓN', 'En Reparación', 'EN REPARACION'],
        'PENDIENTE': ['PENDIENTE', 'Pendiente'],
        'RESUELTOS': ['RESUELTO', 'Resuelto']
      };
      
      const estadosFiltro = estadoMap[this.selectedFilter] || [];
      this.filteredReportes = this.reportes.filter(r => 
        estadosFiltro.some(estado => 
          r.estado.toUpperCase().includes(estado.toUpperCase())
        )
      );
    }
  }

  formatFechaHora(fechaHora: string): string {
    try {
      const fecha = new Date(fechaHora);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const horas = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      return `${dia}/${mes}, ${horas}:${minutos}`;
    } catch {
      // Si no puede parsear, devolver el valor original
      return fechaHora;
    }
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado.toUpperCase();
    if (estadoLower.includes('PENDIENTE')) {
      return 'pendiente';
    } else if (estadoLower.includes('REPARACIÓN') || estadoLower.includes('REPARACION')) {
      return 'reparacion';
    } else if (estadoLower.includes('RESUELTO')) {
      return 'resuelto';
    }
    return 'pendiente';
  }

  updateReporteEstado(reporte: Reporte, nuevoEstado: string): void {
    const idReporte = reporte.idReporte || reporte.id_reporte;
    
    if (!idReporte) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar el reporte a actualizar.',
        confirmButtonColor: '#0d47a1'
      });
      return;
    }
    
    const reporteData = {
      estado: nuevoEstado,
      tipo_incidencia: reporte.tipoIncidencia || reporte.tipo_incidencia,
      detalle_problema: reporte.detalleProblema || reporte.detalle_problema,
      id_bien: reporte.idBien || reporte.id_bien,
      id_usuario: reporte.idDocente || reporte.id_usuario
    };
    
    this.apiService.updateReporte(idReporte, reporteData).subscribe({
      next: () => {
        // Actualizar el estado localmente
        reporte.estado = nuevoEstado;
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El estado del reporte ha sido actualizado correctamente.',
          confirmButtonColor: '#0d47a1',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Recargar reportes
        this.loadAllReportes();
        this.closeDetailModal();
      },
      error: (error) => {
        console.error('Error actualizando reporte:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado del reporte. Por favor, intenta nuevamente.',
          confirmButtonColor: '#0d47a1'
        });
      }
    });
  }

  viewDetails(reporte: Reporte): void {
    // Asegurar que tenemos todos los datos mapeados correctamente
    this.selectedReporte = {
      ...reporte,
      idReporte: reporte.idReporte || reporte.id_reporte,
      id_reporte: reporte.id_reporte || reporte.idReporte,
      estado: reporte.estado || 'PENDIENTE',
      elementoAfectado: reporte.elementoAfectado || reporte.elemento_afectado || 'Sin información',
      tipoIncidencia: reporte.tipoIncidencia || reporte.tipo_incidencia || '',
      reportadoPor: reporte.reportadoPor || reporte.reportado_por || 'Docente',
      fechaHora: reporte.fechaHora || reporte.fecha_hora || '',
      detalleProblema: reporte.detalleProblema || reporte.detalle_problema || '',
      idBien: reporte.idBien || reporte.id_bien,
      idDocente: reporte.idDocente || reporte.id_usuario
    };
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedReporte = null;
  }
}

