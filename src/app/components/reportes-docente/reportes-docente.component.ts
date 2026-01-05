import { Component, OnInit } from '@angular/core';
import { Bien } from '../../models/bien.model';
import { Aula } from '../../models/aula.model';
import { Asignacion } from '../../models/asignacion.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

interface Reporte {
  id_reporte?: number;
  idReporte?: number;
  estado: string;
  elementoAfectado?: string;
  id_bien?: number;
  idBien?: number;
  tipo_incidencia?: string;
  tipoIncidencia: string;
  reportadoPor?: string;
  id_usuario?: number;
  fecha_hora?: string;
  fechaHora?: string;
  detalle_problema?: string;
  detalleProblema: string;
}

@Component({
  selector: 'app-reportes-docente',
  templateUrl: './reportes-docente.component.html',
  styleUrls: ['./reportes-docente.component.scss']
})
export class ReportesDocenteComponent implements OnInit {
  currentUser = 'Docente';
  currentUserId: number = 0;

  // Formulario
  bienSeleccionado: number | null = null;
  tipoIncidencia: string = '';
  detalleProblema: string = '';
  estado: string = 'PENDIENTE';

  // Datos
  bienes: Bien[] = [];
  asignaciones: Asignacion[] = [];
  aulasAsignadas: Aula[] = [];
  misReportes: Reporte[] = [];

  tiposIncidencia: string[] = [
    'Avería',
    'Daño Físico',
    'Pérdida/Ausencia',
    'Mantenimiento',
    'Otro'
  ];

  estados: string[] = [
    'PENDIENTE',
    'EN REPARACIÓN',
    'RESUELTO'
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre || 'Docente';
      this.currentUserId = user.idUsuario;
      
      if (this.currentUserId === 0 && user.email) {
        this.obtenerIdUsuarioPorEmail(user.email);
      } else {
        this.loadAsignaciones();
      }
    }
  }

  obtenerIdUsuarioPorEmail(email: string): void {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        const usuarioEncontrado = usuarios.find(u => u.email === email);
        if (usuarioEncontrado && usuarioEncontrado.idUsuario) {
          this.currentUserId = usuarioEncontrado.idUsuario;
          const user = this.authService.getCurrentUser();
          if (user) {
            user.idUsuario = usuarioEncontrado.idUsuario;
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        }
        this.loadAsignaciones();
      },
      error: (err) => {
        console.error('Error obteniendo usuarios:', err);
        this.loadAsignaciones();
      }
    });
  }

  loadAsignaciones(): void {
    this.apiService.getAsignaciones().subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones.filter(a => {
          const usuarioMatch = a.usuario?.idUsuario === this.currentUserId || a.id_usuario === this.currentUserId;
          const estadoActivo = a.estado === true;
          return usuarioMatch && estadoActivo;
        });
        this.loadAulasFromAsignaciones();
      },
      error: (err) => {
        console.error('Error cargando asignaciones:', err);
        this.loadBienes();
      }
    });
  }

  loadAulasFromAsignaciones(): void {
    this.aulasAsignadas = [];
    
    if (this.asignaciones.length === 0) {
      this.loadBienes();
      return;
    }
    
    this.apiService.getAulas().subscribe({
      next: (todasLasAulas) => {
        this.asignaciones.forEach(asignacion => {
          let aula: Aula | undefined;
          
          if (asignacion.aula && asignacion.aula.idAula) {
            aula = asignacion.aula;
          } else if (asignacion.id_aula) {
            aula = todasLasAulas.find(a => a.idAula === asignacion.id_aula);
          }
          
          if (aula) {
            const yaExiste = this.aulasAsignadas.some(a => a.idAula === aula!.idAula);
            if (!yaExiste) {
              this.aulasAsignadas.push(aula);
            }
          }
        });
        this.loadBienes();
      },
      error: (err) => {
        console.error('Error cargando aulas:', err);
        this.loadBienes();
      }
    });
  }

  loadBienes(): void {
    this.apiService.getBienes().subscribe({
      next: (bienes) => {
        this.bienes = bienes;
        console.log('Bienes cargados:', bienes.length);
        
        // Si ya hay reportes cargados, actualizar los nombres
        if (this.misReportes.length > 0) {
          this.actualizarNombresBienes();
        } else {
          // Si no hay reportes, cargarlos ahora que ya tenemos los bienes
          this.loadMisReportes();
        }
      },
      error: (err) => {
        console.error('Error cargando bienes:', err);
        this.bienes = [];
        this.loadMisReportes();
      }
    });
  }

  loadMisReportes(): void {
    if (!this.currentUserId || this.currentUserId === 0) {
      this.misReportes = [];
      return;
    }

    this.apiService.getReportesByUsuario(this.currentUserId).subscribe({
      next: (reportes) => {
        console.log('Reportes recibidos del backend (raw):', JSON.stringify(reportes, null, 2));
        
        // Mapear los reportes del backend al formato del componente
        this.misReportes = reportes.map((r: any, index: number) => {
          console.log(`Procesando reporte ${index + 1}:`, r);
          console.log(`  - id_bien: ${r.id_bien}`);
          console.log(`  - detalle_problema: ${r.detalle_problema}`);
          console.log(`  - tipo_incidencia: ${r.tipo_incidencia}`);
          console.log(`  - fecha_hora: ${r.fecha_hora}`);
          
          const bienNombre = this.getNombreBien(r.id_bien);
          
          // Normalizar fecha - puede venir en diferentes formatos
          let fechaHora = r.fecha_hora || r.fechaHora || null;
          
          // Normalizar detalle_problema - puede venir en diferentes propiedades
          const detalleProblema = r.detalle_problema || r.detalleProblema || r.detalle || '';
          
          // Normalizar tipo_incidencia
          const tipoIncidencia = r.tipo_incidencia || r.tipoIncidencia || '';
          
          const reporteMapeado = {
            id_reporte: r.id_reporte || r.idReporte,
            idReporte: r.id_reporte || r.idReporte,
            estado: r.estado || 'PENDIENTE',
            id_bien: r.id_bien || r.idBien,
            idBien: r.id_bien || r.idBien,
            tipo_incidencia: tipoIncidencia,
            tipoIncidencia: tipoIncidencia,
            id_usuario: r.id_usuario || r.idUsuario,
            fecha_hora: fechaHora,
            fechaHora: fechaHora,
            detalle_problema: detalleProblema,
            detalleProblema: detalleProblema,
            elementoAfectado: bienNombre,
            reportadoPor: this.currentUser
          };
          
          console.log(`Reporte ${index + 1} mapeado:`, reporteMapeado);
          return reporteMapeado;
        });
        
        console.log('Reportes mapeados finales:', this.misReportes);
        
        // Si los bienes ya están cargados, intentar actualizar los nombres
        this.actualizarNombresBienes();
      },
      error: (err) => {
        console.error('Error cargando reportes:', err);
        this.misReportes = [];
      }
    });
  }

  actualizarNombresBienes(): void {
    // Actualizar los nombres de los bienes si los bienes ya están cargados
    if (this.bienes.length > 0 && this.misReportes.length > 0) {
      let actualizado = false;
      this.misReportes.forEach(reporte => {
        if (reporte.id_bien || reporte.idBien) {
          const idBien = reporte.id_bien || reporte.idBien;
          const bienNombre = this.getNombreBien(idBien);
          
          // Actualizar siempre que no sea "Cargando..." y sea diferente
          if (bienNombre !== 'Cargando...' && bienNombre !== `Bien #${idBien}` && reporte.elementoAfectado !== bienNombre) {
            reporte.elementoAfectado = bienNombre;
            actualizado = true;
          }
        }
      });
      
      if (actualizado) {
        console.log('Nombres de bienes actualizados en los reportes');
      }
    }
  }

  getBienesDisponibles(): Bien[] {
    if (this.aulasAsignadas.length === 0) {
      return [];
    }
    
    return this.bienes.filter(b => {
      if (!b.aula || !b.aula.idAula) {
        return false;
      }
      return this.aulasAsignadas.some(a => a.idAula === b.aula!.idAula);
    });
  }

  getNombreBien(idBien: number | undefined): string {
    if (!idBien) return 'Cargando...';
    
    // Buscar el bien en la lista cargada
    const bien = this.bienes.find(b => b.idBien === idBien);
    
    if (bien) {
      return bien.nombreBien || `Bien #${idBien}`;
    }
    
    // Si no se encuentra, mostrar que se está cargando (si los bienes aún no se han cargado)
    // o el ID si ya se cargaron pero no se encontró
    if (this.bienes.length === 0) {
      return 'Cargando...';
    }
    
    // Si los bienes ya se cargaron pero no se encuentra este, mostrar el ID
    return `Bien #${idBien}`;
  }

  formatFechaHora(fechaHora: string | undefined | null): string {
    if (!fechaHora) return 'Sin fecha';
    
    try {
      // Intentar parsear la fecha
      let fecha: Date;
      
      // Si es un string, crear el objeto Date
      if (typeof fechaHora === 'string') {
        fecha = new Date(fechaHora);
      } else {
        fecha = fechaHora as any;
      }
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      const horas = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      
      return `${dia}/${mes}/${anio}, ${horas}:${minutos}`;
    } catch (error) {
      console.error('Error formateando fecha:', fechaHora, error);
      return typeof fechaHora === 'string' ? fechaHora.substring(0, 16) : 'Fecha inválida';
    }
  }

  enviarReporte(): void {
    if (!this.bienSeleccionado || !this.tipoIncidencia || !this.detalleProblema) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (!this.currentUserId || this.currentUserId === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error de usuario',
        text: 'No se pudo identificar al usuario',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const bien = this.bienes.find(b => b.idBien === this.bienSeleccionado);
    if (!bien) {
      Swal.fire({
        icon: 'error',
        title: 'Bien no encontrado',
        text: 'No se encontró el bien seleccionado',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Preparar datos para enviar al backend
    // Nota: El backend puede generar fecha_hora automáticamente, por lo que no la enviamos
    const reporteData = {
      id_bien: bien.idBien,
      id_usuario: this.currentUserId,
      tipo_incidencia: this.tipoIncidencia,
      detalle_problema: this.detalleProblema,
      estado: this.estado
    };

    console.log('Enviando reporte al backend:', reporteData);

    // Enviar al backend
    this.apiService.createReporte(reporteData).subscribe({
      next: (reporteCreado) => {
        console.log('Reporte creado exitosamente:', reporteCreado);
        Swal.fire({
          icon: 'success',
          title: 'Reporte enviado',
          text: 'El reporte se ha creado correctamente',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        // Recargar los reportes desde el backend
        this.loadMisReportes();

        // Limpiar formulario
        this.bienSeleccionado = null;
        this.tipoIncidencia = '';
        this.detalleProblema = '';
        this.estado = 'PENDIENTE';
      },
      error: (err) => {
        console.error('Error completo al crear el reporte:', err);
        console.error('URL:', err.url);
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('Error body:', err.error);
        
        // Mensaje de error más detallado
        let errorMessage = 'No se pudo crear el reporte. ';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage += err.error;
          } else if (err.error.message) {
            errorMessage += err.error.message;
          } else if (err.error.error) {
            errorMessage += err.error.error;
          }
        } else if (err.status === 400) {
          errorMessage += 'Los datos enviados no son válidos. Verifique la consola para más detalles.';
        } else if (err.status === 401) {
          errorMessage += 'No tiene autorización. Por favor, inicie sesión nuevamente.';
        } else if (err.status === 500) {
          errorMessage += 'Error en el servidor. Por favor, contacte al administrador.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al crear reporte',
          html: `<p>${errorMessage}</p><p style="font-size: 12px; margin-top: 10px; color: #666;">Revisa la consola del navegador para más detalles.</p>`,
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('pendiente')) {
      return 'pendiente';
    } else if (estadoLower.includes('reparación') || estadoLower.includes('reparacion')) {
      return 'reparacion';
    } else if (estadoLower.includes('resuelto')) {
      return 'resuelto';
    }
    return 'pendiente';
  }

  truncateText(text: string | undefined, maxLength: number = 50): string {
    if (!text || text.trim() === '') {
      return '-';
    }
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  showDetailModal: boolean = false;
  selectedReporte: Reporte | null = null;

  viewDetails(reporte: Reporte): void {
    // Asegurar que tenemos todos los datos disponibles
    const reporteDetalle: Reporte = {
      ...reporte,
      // Asegurar que tenemos el nombre del bien actualizado
      elementoAfectado: this.getNombreBien(reporte.id_bien || reporte.idBien) || reporte.elementoAfectado || 'Sin información',
      // Asegurar que tenemos el detalle del problema (probar ambas propiedades)
      detalleProblema: reporte.detalleProblema || reporte.detalle_problema || 'Sin detalle',
      tipoIncidencia: reporte.tipoIncidencia || reporte.tipo_incidencia || 'Sin tipo',
      fechaHora: reporte.fechaHora || reporte.fecha_hora || undefined,
      estado: reporte.estado || 'PENDIENTE',
      reportadoPor: reporte.reportadoPor || this.currentUser
    };
    
    console.log('Mostrando detalles del reporte:', reporteDetalle);
    this.selectedReporte = reporteDetalle;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedReporte = null;
  }
}

