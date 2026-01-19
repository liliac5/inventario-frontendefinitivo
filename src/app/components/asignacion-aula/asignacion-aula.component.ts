import { Component, OnInit } from '@angular/core';
import { Asignacion } from '../../models/asignacion.model';
import { Aula } from '../../models/aula.model';
import { Usuario } from '../../models/usuario.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-aula',
  standalone: false,
  templateUrl: './asignacion-aula.component.html',
  styleUrls: ['./asignacion-aula.component.scss']
})
export class AsignacionAulaComponent implements OnInit {
  currentUser: string = 'Administrador';
  
  // Listas
  aulas: Aula[] = [];
  fechaHoy: string = '';

  usuarios: Usuario[] = [];
  asignaciones: Asignacion[] = [];
 // Modal editar
showEditModal = false;
asignacionEditando: Asignacion | null = null;
mostrarAlerta = false;
mensajeAlerta = '';
  // Formulario
  selectedUsuarioId: number = 0;
  selectedAulaId: number = 0;
  fechaSolicitud: string = new Date().toISOString().split('T')[0];
nuevoUsuarioId: number  | null = null;
nuevaAulaId: number  | null = null;
nuevaFecha: string = new Date().toISOString().split('T')[0];
editUsuarioId: number = 0;
editAulaId: number = 0;
editFecha: string = '';
tituloAlerta = '';
tipoAlerta: 'error' | 'success' = 'error';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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
    } else {
      this.currentUser = 'Administrador';
    }
    this.loadAulas();
    this.loadUsuarios();
    this.loadAsignaciones();
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');

  this.fechaHoy = `${year}-${month}-${day}`;
  }

  loadAulas(): void {
    this.apiService.getAulas().subscribe({
      next: (aulas) => {
        this.aulas = aulas;
      },
      error: (error) => {
        console.error('Error cargando aulas:', error);
      }
    });
  }

  loadUsuarios(): void {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  loadAsignaciones(): void {
    this.apiService.getAsignaciones().subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones;
      },
      error: (error) => {
        console.error('Error cargando asignaciones:', error);
      }
    });
  }
mostrarMensaje(titulo: string, mensaje: string, tipo: 'error' | 'success') {
  this.tituloAlerta = titulo;
  this.mensajeAlerta = mensaje;
  this.tipoAlerta = tipo;
  this.mostrarAlerta = true;
}

registrarAsignacion(): void {

  if (!this.nuevoUsuarioId || !this.nuevaAulaId) {
    Swal.fire(
      'Campos incompletos',
      'Debe seleccionar un usuario y un aula.',
      'warning'
    );
    return;
  }

  // Siempre usar la fecha actual, ignorando cualquier valor del campo
  const fechaActual = this.fechaHoy;

  const body = {
    idUsuario: this.nuevoUsuarioId,
    idAula: this.nuevaAulaId,
    fechaSolicitud: fechaActual
  };

  this.apiService.createAsignacion(body).subscribe({
    next: (asignacionCreada) => {
      this.asignaciones.push(asignacionCreada);

      Swal.fire(
        'Asignación registrada',
        'La asignación se registró correctamente.',
        'success'
      );

      this.resetForm();
    },
    error: () => {
      Swal.fire(
        'Error',
        'No se pudo registrar la asignación.',
        'error'
      );
    }
  });
}


 resetForm(): void {
  this.nuevoUsuarioId = null;
  this.nuevaAulaId = null;
  this.nuevaFecha = this.fechaHoy;
}


  getUsuarioNombre(id_usuario: number): string {
    const usuario = this.usuarios.find(u => u.idUsuario === id_usuario);
    return usuario ? usuario.nombre : 'N/A';
  }

  getAulaNombre(idAula: number): string {
  const aula = this.aulas.find(a => a.idAula === idAula);
  return aula ? aula.nombre : 'N/A';
}



getAulasDisponibles(): Aula[] {
  const aulasAsignadas = this.asignaciones
    .filter(a => a.estado === true)
    .map(a => a.aula.idAula);

  return this.aulas.filter(
    aula => !aulasAsignadas.includes(aula.idAula) && aula.estado === true
  );
}
getAulasDisponiblesParaEditar(): Aula[] {
  if (!this.asignacionEditando) return [];

  const idAulaActual = this.asignacionEditando.aula.idAula;

  const aulasAsignadas = this.asignaciones
    .filter(a =>
      a.estado === true &&
      a.aula.idAula !== idAulaActual
    )
    .map(a => a.aula.idAula);

  return this.aulas.filter(
    aula =>
      aula.estado === true &&
      (
        aula.idAula === idAulaActual ||
        !aulasAsignadas.includes(aula.idAula)
      )
  );
}



toggleEstadoAsignacion(asignacion: Asignacion): void {
  const body = {
    idUsuario: asignacion.usuario?.idUsuario,
    idAula: asignacion.aula?.idAula,
    estado: !asignacion.estado
  };

  this.apiService
    .updateAsignacion(asignacion.idAsignacion!, body)
    .subscribe({
      next: (res) => {
        const index = this.asignaciones.findIndex(
          a => a.idAsignacion === res.idAsignacion
        );

        if (index !== -1) {
          this.asignaciones[index] = res;
        }
      },
      error: (error) => {
        console.error('Error actualizando asignación:', error);
        alert('Error al actualizar la asignación.');
      }
    });
}


  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES');
  }
  
openEditModal(asignacion: Asignacion): void {
  this.asignacionEditando = asignacion;

  this.editUsuarioId = asignacion.usuario.idUsuario;
  this.editAulaId = asignacion.aula.idAula;
  // Siempre usar la fecha actual
  this.editFecha = this.fechaHoy;
  this.showEditModal = true;
}




closeEditModal(): void {
  this.showEditModal = false;
  this.asignacionEditando = null;
}


eliminarAsignacion(id: number): void {
  Swal.fire({
    title: '¿Eliminar asignación?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c62828',
    cancelButtonColor: '#9e9e9e',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      this.apiService.deleteAsignacion(id).subscribe({
        next: () => {
          this.asignaciones = this.asignaciones.filter(
            a => a.idAsignacion !== id
          );

          Swal.fire(
            'Eliminada',
            'La asignación fue eliminada correctamente.',
            'success'
          );
        },
        error: () => {
          Swal.fire(
            'Error',
            'No se pudo eliminar la asignación.',
            'error'
          );
        }
      });
    }
  });
}

updateAsignacion(): void {
  if (!this.asignacionEditando) return;

  if (!this.editUsuarioId || !this.editAulaId) {
    Swal.fire(
      'Campos incompletos',
      'Debe seleccionar un usuario y un aula.',
      'warning'
    );
    return;
  }

  const body = {
    idUsuario: this.editUsuarioId,
    idAula: this.editAulaId,
    estado: this.asignacionEditando.estado
  };

  this.apiService
    .updateAsignacion(this.asignacionEditando.idAsignacion!, body)
    .subscribe({
      next: (res) => {
        const index = this.asignaciones.findIndex(
          a => a.idAsignacion === res.idAsignacion
        );

        if (index !== -1) {
          this.asignaciones[index] = res;
        }

        Swal.fire(
          'Asignación actualizada',
          'Los datos se actualizaron correctamente.',
          'success'
        );

        this.closeEditModal();
      },
      error: () => {
        Swal.fire(
          'Error',
          'No se pudo actualizar la asignación.',
          'error'
        );
      }
    });
}



}

