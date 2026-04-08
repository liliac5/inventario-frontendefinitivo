import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { Asignacion } from '../../models/asignacion.model';
import { Bien } from '../../models/bien.model';
import { Aula } from '../../models/aula.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BienesService } from '../../services/bienes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-portal-docente',
  templateUrl: './portal-docente.component.html',
  styleUrls: ['./portal-docente.component.scss']
})
export class PortalDocenteComponent implements OnInit {
  currentUser = 'Docente';
  currentUserId: number = 0;

  // Formulario
  aulaSeleccionada: number | null = null;
  tipoSolicitud: string = '';
  detalleProblema?: string ;

  showToast: boolean = false;
toastMessage: string = '';
toastType: 'success' | 'error' = 'success';

  // Datos
  bienes: Bien[] = [];
  asignaciones: Asignacion[] = [];
  misSolicitudes: Solicitud[] = [];
  aulasAsignadas: Aula[] = [];
  tiposSolicitud: string[] = [
    'Mobiliario (sillas, mesas, pizarrón)',
    'Equipamiento (proyector, PCs, red)',
    'Infraestructura (paredes, luz, aire acondicionado)',
    'Otros (Limpieza, seguridad, etc.)'
  ];
  bienSeleccionado: number | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private bienesService: BienesService
  ) {}

 ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  console.log('🔐 Usuario obtenido del auth service:', user);

  if (user) {
    this.currentUser = user.nombre || 'Docente';
    this.currentUserId = user.idUsuario;
    
    // Si el idUsuario es 0, intentar obtener el ID real del usuario por cédula
    if (this.currentUserId === 0 && (user.cedula || user.email)) {
      this.obtenerIdUsuarioPorCedula(user.cedula || user.email);
    } else {
      this.loadAsignaciones();
    }
  } else {
    console.warn('⚠️ No hay usuario autenticado');
  }
}
showToastMessage(message: string, type: 'success' | 'error' = 'success') {
  this.toastMessage = message;
  this.toastType = type;
  this.showToast = true;

  setTimeout(() => {
    this.showToast = false;
  }, 3000); // 3 segundos
}

closeToast() {
  this.showToast = false;
}
obtenerIdUsuarioPorCedula(cedula: string): void {
  this.apiService.getUsuarios().subscribe({
    next: (usuarios) => {
      const usuarioEncontrado = usuarios.find(u =>
        u.cedula === cedula || u.email === cedula
      );
      if (usuarioEncontrado && usuarioEncontrado.idUsuario) {
        this.currentUserId = usuarioEncontrado.idUsuario;
        console.log('✅ ID de usuario actualizado:', this.currentUserId);
        // Actualizar el usuario en localStorage
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
      this.loadAsignaciones(); // Continuar de todas formas
    }
  });
}




loadAsignaciones(): void {
  this.apiService.getAsignaciones().subscribe({
    next: (asignaciones) => {
      console.log('🔍 Todas las asignaciones recibidas:', asignaciones);
      console.log('👤 ID Usuario actual:', this.currentUserId);
      
      // Filtrar asignaciones del usuario actual que estén activas
      this.asignaciones = asignaciones.filter(a => {
        const usuarioMatch = a.usuario?.idUsuario === this.currentUserId || a.id_usuario === this.currentUserId;
        const estadoActivo = a.estado === true;
        console.log(`Asignación ${a.idAsignacion}: usuario=${usuarioMatch}, estado=${estadoActivo}, aula=${a.aula?.nombre || a.id_aula}`);
        return usuarioMatch && estadoActivo;
      });
      
      console.log('✅ Asignaciones filtradas para este usuario:', this.asignaciones);
      
      // Cargar aulas desde las asignaciones
      this.loadAulasFromAsignaciones();
    },
    error: (err) => {
      console.error('❌ Error cargando asignaciones:', err);
      this.loadBienes(); // Continuar aunque falle
    }
  });
}

loadAulasFromAsignaciones(): void {
  this.aulasAsignadas = [];
  
  if (this.asignaciones.length === 0) {
    console.log('⚠️ No hay asignaciones para este usuario');
    this.loadBienes();
    return;
  }
  
  // Obtener todas las aulas primero
  this.apiService.getAulas().subscribe({
    next: (todasLasAulas) => {
      console.log('🏫 Todas las aulas disponibles:', todasLasAulas);
      
      // Para cada asignación, obtener el aula correspondiente
      this.asignaciones.forEach(asignacion => {
        let aula: Aula | undefined;
        
        // Intentar obtener el aula del objeto asignacion
        if (asignacion.aula && asignacion.aula.idAula) {
          aula = asignacion.aula;
        }
        // Si no, buscar por id_aula en todas las aulas
        else if (asignacion.id_aula) {
          aula = todasLasAulas.find(a => a.idAula === asignacion.id_aula);
        }
        
        // Agregar el aula si existe y no está ya en la lista
        if (aula) {
          const yaExiste = this.aulasAsignadas.some(a => a.idAula === aula!.idAula);
          if (!yaExiste) {
            this.aulasAsignadas.push(aula);
            console.log(`✅ Aula agregada: ${aula.nombre} (ID: ${aula.idAula})`);
          }
        } else {
          console.log(`⚠️ No se encontró el aula para la asignación ${asignacion.idAsignacion}`);
        }
      });
      
      console.log('📚 Aulas asignadas finales:', this.aulasAsignadas);
      
      this.loadBienes();
    },
    error: (err) => {
      console.error('❌ Error cargando aulas:', err);
      // Intentar usar las aulas que vienen en las asignaciones
      this.asignaciones.forEach(asignacion => {
        if (asignacion.aula && asignacion.aula.idAula) {
          const yaExiste = this.aulasAsignadas.some(a => a.idAula === asignacion.aula.idAula);
          if (!yaExiste) {
            this.aulasAsignadas.push(asignacion.aula);
          }
        }
      });
      this.loadBienes();
    }
  });
}

loadBienes(): void {
  this.apiService.getBienes().subscribe({
    next: (bienes) => {
      console.log('📦 Todos los bienes recibidos:', bienes);
      
      // Cargar todos los bienes sin filtrar por ahora
      this.bienes = bienes;
      
      // Si no hay aulas desde asignaciones, extraer aulas de los bienes
      if (this.aulasAsignadas.length === 0) {
        this.loadAulasFromBienes(bienes);
      }
      
      console.log('📦 Bienes cargados:', this.bienes.length);
      console.log('🏫 Aulas asignadas:', this.aulasAsignadas);
      
      // Seleccionar primera aula si no hay una seleccionada
      if (this.aulasAsignadas.length > 0 && !this.aulaSeleccionada) {
        this.aulaSeleccionada = this.aulasAsignadas[0].idAula;
        this.onAulaChange();
      }
      
      this.loadMisSolicitudes();
    },
    error: (err) => {
      console.error('❌ Error cargando bienes:', err);
      this.bienes = [];
      this.loadMisSolicitudes();
    }
  });
}

loadAulasFromBienes(bienes: Bien[]): void {
  // Fallback: cargar aulas desde bienes si no hay asignaciones
  bienes.forEach(b => {
    if (b.aula) {
      const aula = b.aula;
      if (!this.aulasAsignadas.some(a => a.idAula === aula.idAula)) {
        this.aulasAsignadas.push(aula);
      }
    }
  });
  
  // Seleccionar primera aula por defecto
  if (this.aulasAsignadas.length > 0 && !this.aulaSeleccionada) {
    this.aulaSeleccionada = this.aulasAsignadas[0].idAula;
    this.onAulaChange();
  }
}




loadMisSolicitudes(): void {
  if (!this.currentUserId || this.currentUserId === 0) {
    console.warn('No se puede cargar solicitudes: ID de usuario no válido');
    return;
  }

  this.apiService.getSolicitudesDocente(this.currentUserId).subscribe({
    next: (solicitudes: Solicitud[]) => {
      this.misSolicitudes = solicitudes;
    },
    error: err => {
      console.error('Error cargando solicitudes:', err);
      this.misSolicitudes = [];
    }
  });
}





onAulaChange(): void {
  // Limpiar bien seleccionado cuando cambia el aula
  this.bienSeleccionado = null;
  
  // Actualizar bienes asignados para el aula seleccionada
  const bienesFiltrados = this.getBienesAsignados();
  if (bienesFiltrados.length > 0 && !this.bienSeleccionado) {
    // Opcional: seleccionar el primer bien automáticamente
    // this.bienSeleccionado = bienesFiltrados[0].idBien;
  }
}

getBienesAsignados(): Bien[] {
  if (!this.aulaSeleccionada) {
    console.log('⚠️ No hay aula seleccionada');
    return [];
  }
  
  const bienesFiltrados = this.bienes.filter(b => {
    // Verificar si el bien tiene aula y coincide con la seleccionada
    if (!b.aula || !b.aula.idAula) {
      console.log(`⚠️ Bien ${b.idBien} (${b.nombreBien}) no tiene aula asignada`);
      return false;
    }
    
    const coincide = b.aula.idAula === this.aulaSeleccionada;
    return coincide;
  });
  
  console.log(`✅ Bienes para aula ${this.aulaSeleccionada}:`, bienesFiltrados.length);
  console.log('📋 Bienes filtrados:', bienesFiltrados.map(b => `${b.nombreBien} (Aula: ${b.aula?.nombre || 'N/A'})`));
  
  return bienesFiltrados;
}

getTipoSolicitud(solicitud: Solicitud): string {
  if (!solicitud.descripcion) {
    return 'N/A';
  }
  const partes = solicitud.descripcion.split(':');
  return partes[0] || solicitud.descripcion;
}

getDetalleSolicitud(solicitud: Solicitud): string {
  if (!solicitud.descripcion) {
    return '-';
  }
  const partes = solicitud.descripcion.split(':');
  if (partes.length > 1) {
    return partes.slice(1).join(':').trim() || '-';
  }
  return '-';
}



enviarSolicitud(): void {
  // Validar que todos los campos estén completos
  if (!this.aulaSeleccionada || !this.bienSeleccionado || !this.tipoSolicitud || !this.detalleProblema) {
    Swal.fire({
      icon: 'error',
      title: 'Campos incompletos',
      text: 'Por favor complete todos los campos',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  // Buscar el bien seleccionado
  const bienRelacionado = this.bienes.find(b => b.idBien === this.bienSeleccionado);

  if (!bienRelacionado) {
    Swal.fire({
      icon: 'error',
      title: 'Bien no encontrado',
      text: 'No se encontró el bien seleccionado',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  // Construir objeto a enviar al backend
  const body = {
    idBien: bienRelacionado.idBien,
    descripcion: `${this.tipoSolicitud}: ${this.detalleProblema}`,
    estado: 'PENDIENTE'
  };

  // Llamar al API para crear la solicitud
  this.apiService.createSolicitud(body).subscribe({
    next: (res) => {
      (res as any).bien = bienRelacionado;

      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: 'La solicitud se ha enviado correctamente',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      this.loadMisSolicitudes();

      // Limpiar formulario
      this.detalleProblema = '';
      this.tipoSolicitud = '';
      this.bienSeleccionado = null;
      if (this.aulasAsignadas.length > 0) {
        this.aulaSeleccionada = this.aulasAsignadas[0].idAula;
        this.onAulaChange();
      }
    },
    error: (err) => {
      console.error('Error al enviar la solicitud:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar la solicitud',
        confirmButtonColor: '#3085d6'
      });
    }
  });
}

}
