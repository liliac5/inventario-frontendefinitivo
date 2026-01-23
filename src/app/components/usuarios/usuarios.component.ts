import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  currentUser: string = 'Administrador';
  searchTerm = '';
  showAddModal = false;
  showEditModal = false;
  today: string = '';


  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  roles: Rol[] = [];

  nuevoUsuario: Partial<Usuario> = {
    nombre: '',
    nombres_completos: '',
    cedula: '',
    email: '',
    estado: true,
    fechaRegistro: '',
    idRol: 0
  };

  passwordTemp = '';
  editPasswordTemp = '';
  showPassword = false;
  isEditMode: boolean = false;
  usuarioEditId: number | null = null;
  isCedulaLoading = false;
  cedulaError = '';
  usuarioYaCreado = false;
  private cedulaLookupTimeout: number | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Calcular fecha actual en zona horaria local (no UTC)
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    this.today = `${year}-${month}-${day}`;
    
    this.loadRoles();
    this.loadUsuarios();
  }

  loadRoles(): void {
    this.apiService.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        if (roles.length && !this.nuevoUsuario.idRol) {
          this.nuevoUsuario.idRol = roles[0].idRol;
        }
      },
      error: err => console.error('Error cargando roles', err)
    });
  }

  loadUsuarios(): void {
    this.apiService.getUsuarios().subscribe({
      next: (usuariosResponse: any) => {
        const usuarios: Usuario[] = Array.isArray(usuariosResponse)
          ? usuariosResponse
          : usuariosResponse?.data || usuariosResponse?.content || usuariosResponse?.usuarios || [];

        console.log('Usuarios recibidos del backend:', usuarios);
        // Log detallado de cada usuario
        usuarios.forEach((usuario, index) => {
          console.log(`Usuario ${index + 1}:`, {
            nombre: usuario.nombre,
            nombres_completos: usuario.nombres_completos,
            cedula: usuario.cedula,
            idRol: usuario.idRol,
            rol: usuario.rol,
            rolNombre: usuario.rol?.nombre
          });
        });
        const usuariosConRol = usuarios.filter(usuario =>
          this.hasAssignedRole(usuario) || this.isCurrentUser(usuario)
        );
        this.usuarios = usuariosConRol;
        this.filteredUsuarios = [...usuariosConRol];
        // Verificar que los roles estén cargados
        console.log('Roles disponibles:', this.roles);
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    this.filteredUsuarios = this.usuarios.filter(u =>
      this.getNombreCompleto(u).toLowerCase().includes(term) ||
      this.getCedula(u).toLowerCase().includes(term) ||
      this.getRolNombre(u.idRol, u).toLowerCase().includes(term)
    );
  }

  openEditModal(usuario: Usuario): void {
  this.usuarioEditId = usuario.idUsuario;

  this.nuevoUsuario = {
    nombre: usuario.nombre,
    nombres_completos: usuario.nombres_completos || usuario.nombreCompleto || usuario.nombre || '',
    cedula: usuario.cedula || (usuario as any).cedulaUsuario || (usuario as any).numeroCedula || '',
    email: usuario.email,
    estado: usuario.estado,
    idRol: usuario.idRol
  };

  this.showEditModal = true;
  this.editPasswordTemp = '';
}

closeEditModal(): void {
  this.showEditModal = false;
  this.usuarioEditId = null;
  this.editPasswordTemp = '';
}

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onCedulaInput(): void {
    const cedula = (this.nuevoUsuario.cedula || '').toString().trim();
    this.cedulaError = '';
    this.nuevoUsuario.nombre = '';
    this.nuevoUsuario.nombres_completos = '';
    this.usuarioYaCreado = false;

    if (this.cedulaLookupTimeout) {
      window.clearTimeout(this.cedulaLookupTimeout);
    }

    if (!cedula) {
      return;
    }

    this.cedulaLookupTimeout = window.setTimeout(() => {
      const cedulaRegex = /^\d{10}$/;
      if (!cedulaRegex.test(cedula)) {
        this.cedulaError = 'Ingrese una cédula válida';
        return;
      }

      this.fetchUsuarioPorCedula(cedula);
    }, 400);
  }

  private fetchUsuarioPorCedula(cedula: string): void {
    this.isCedulaLoading = true;
    const localUsuario = this.findUsuarioInList(cedula);
    if (localUsuario) {
      this.applyUsuarioFromLookup(localUsuario, cedula);
      this.isCedulaLoading = false;
      return;
    }

    // Intentar endpoint específico si existe; si falla, usar listado
    this.apiService.getUsuarioByCedula(cedula).subscribe({
      next: usuario => {
        if (usuario) {
          this.applyUsuarioFromLookup(usuario, cedula);
          this.cedulaError = '';
        } else {
          this.searchUsuarioInListado(cedula);
        }
        this.isCedulaLoading = false;
      },
      error: () => {
        this.searchUsuarioInListado(cedula);
      }
    });
  }

  private searchUsuarioInListado(cedula: string): void {
    this.apiService.getUsuarios().subscribe({
      next: usuarios => {
        const usuario = usuarios.find(u => this.cedulaMatches(cedula, this.getCedula(u)));
        if (usuario) {
          this.applyUsuarioFromLookup(usuario, cedula);
          this.cedulaError = '';
        } else {
          this.nuevoUsuario.nombre = '';
          this.nuevoUsuario.nombres_completos = '';
          this.cedulaError = 'No se encontró la cédula';
        }
        this.isCedulaLoading = false;
      },
      error: () => {
        this.nuevoUsuario.nombre = '';
        this.nuevoUsuario.nombres_completos = '';
        this.cedulaError = 'No se pudo validar la cédula';
        this.isCedulaLoading = false;
      }
    });
  }

  private findUsuarioInList(cedula: string): Usuario | undefined {
    if (!this.usuarios.length) return undefined;
    return this.usuarios.find(u => this.cedulaMatches(cedula, this.getCedula(u)));
  }

  private applyUsuarioFromLookup(usuario: Usuario, cedulaFallback: string): void {
    const nombre =
      usuario.nombres_completos ||
      usuario.nombreCompleto ||
      usuario.nombre ||
      '';
    const cedulaRespuesta =
      usuario.cedula ||
      (usuario as any).cedulaUsuario ||
      (usuario as any).numeroCedula ||
      cedulaFallback;
    const nombreNormalizado = nombre ? String(nombre).trim() : '';
    this.nuevoUsuario.nombres_completos = nombreNormalizado;
    this.nuevoUsuario.nombre = nombreNormalizado;
    this.nuevoUsuario.cedula = cedulaRespuesta ? String(cedulaRespuesta).trim() : cedulaFallback;
    if (!this.nuevoUsuario.nombres_completos) {
      this.cedulaError = 'No se encontraron nombres';
      return;
    }

    if (this.hasAssignedRole(usuario) && this.isUsuarioActivo(usuario)) {
      this.usuarioYaCreado = true;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Usuario ya creado',
        text: 'Este usuario ya tiene rol y clave asignados.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      return;
    }

    this.cedulaError = '';
  }

  hasNombreEncontrado(): boolean {
    return !!(this.nuevoUsuario.nombres_completos || '').trim();
  }

  private normalizeCedula(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\D/g, '');
  }

  private getRoleId(usuario: Usuario): number | null {
    const idRol =
      usuario.idRol ??
      (usuario as any).id_rol ??
      (usuario as any).idRol ??
      usuario.rol?.idRol ??
      (usuario as any).rol?.id ??
      (usuario as any).rolId;
    if (idRol === null || idRol === undefined) return null;
    const parsed = Number(idRol);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private hasAssignedRole(usuario: Usuario): boolean {
    const idRol = this.getRoleId(usuario);
    if (idRol && idRol > 0) return true;
    const rolNombre =
      usuario.rol?.nombre ||
      (usuario as any).rolNombre ||
      (usuario as any).rol;
    return typeof rolNombre === 'string' && rolNombre.trim().length > 0;
  }

  private isUsuarioActivo(usuario: Usuario): boolean {
    const estado =
      usuario.estado ??
      (usuario as any).activo ??
      (usuario as any).isActive ??
      true;
    return estado === true;
  }

  private isCurrentUser(usuario: Usuario): boolean {
    const current = this.authService.getCurrentUser();
    if (!current) return false;
    const currentCedula = this.normalizeCedula((current as any).cedula || current.email || '');
    const usuarioCedula = this.normalizeCedula(this.getCedula(usuario));
    return !!currentCedula && currentCedula === usuarioCedula;
  }

  private cedulaMatches(input: string, candidate: string): boolean {
    const normalizedInput = this.normalizeCedula(input);
    const normalizedCandidate = this.normalizeCedula(candidate);
    if (!normalizedInput || !normalizedCandidate) return false;
    if (normalizedInput === normalizedCandidate) return true;

    const inputNoZeros = normalizedInput.replace(/^0+/, '');
    const candidateNoZeros = normalizedCandidate.replace(/^0+/, '');
    return !!inputNoZeros && inputNoZeros === candidateNoZeros;
  }

saveUsuario(): void {
  if (this.isCedulaLoading) {
    Swal.fire({
      icon: 'info',
      title: 'Buscando usuario',
      text: 'Espere un momento mientras se cargan los nombres',
      confirmButtonColor: '#0d47a1'
    });
    return;
  }

  if (this.usuarioYaCreado) {
    Swal.fire({
      icon: 'info',
      title: 'Usuario ya creado',
      text: 'No puede crear un usuario que ya tiene rol y clave.',
      confirmButtonColor: '#0d47a1'
    });
    return;
  }

  if (!this.nuevoUsuario.cedula || !this.nuevoUsuario.nombres_completos || !this.passwordTemp || !this.nuevoUsuario.idRol || this.cedulaError) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Debe completar todos los campos obligatorios',
      confirmButtonColor: '#ff6f00'
    });
    return;
  }

  // Siempre usar la fecha actual en zona horaria local (no UTC)
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const fechaActual = `${year}-${month}-${day}`;

  const payload = {
    idUsuario: 0,
    nombre: this.nuevoUsuario.nombres_completos,
    nombres_completos: this.nuevoUsuario.nombres_completos,
    cedula: this.nuevoUsuario.cedula,
    email: '',
    contraseña: this.passwordTemp,
    contrasena: this.passwordTemp,
    password: this.passwordTemp,
    clave: this.passwordTemp,
    estado: this.nuevoUsuario.estado ?? true,
    fechaRegistro: fechaActual,
    idRol: this.nuevoUsuario.idRol!,
    id_rol: this.nuevoUsuario.idRol!,
    rol: this.nuevoUsuario.idRol!
  };

  this.apiService.createUsuario(payload).subscribe({
    next: u => {
      this.usuarios.push(u);
      this.filteredUsuarios = [...this.usuarios];
      this.closeAddModal();

      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario se registró exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (error) => {
      console.error('Error creando usuario:', error);
      const rawError = error?.error;
      const backendMessage =
        rawError?.message ||
        rawError?.error ||
        (typeof rawError === 'string' ? rawError : '') ||
        error?.message ||
        '';
      const backendDetails =
        backendMessage ||
        (rawError && typeof rawError === 'object'
          ? JSON.stringify(rawError)
          : '');
      const status = error?.status ? ` (HTTP ${error.status})` : '';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: backendDetails
          ? `${backendDetails}${status}`
          : `No se pudo crear el usuario${status}`,
        confirmButtonColor: '#d32f2f'
      });
    }
  });
}

toggleEstado(usuario: Usuario): void {
  Swal.fire({
    title: usuario.estado ? '¿Desactivar usuario?' : '¿Activar usuario?',
    text: `Usuario: ${usuario.nombre}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff6f00',
    cancelButtonColor: '#9e9e9e',
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (!result.isConfirmed) return;

    const payload = {
      nombre: usuario.nombre,
      email: usuario.email,
      estado: usuario.estado ? false : true,
      idRol: usuario.idRol
    };

    this.apiService.updateUsuario(usuario.idUsuario, payload).subscribe({
     next: (usuarioActualizado) => {

  const estadoBooleano = String(usuarioActualizado.estado) === 'true';

  const index = this.usuarios.findIndex(
    u => u.idUsuario === usuario.idUsuario
  );

  if (index !== -1) {
    this.usuarios[index] = {
      ...this.usuarios[index],
      estado: estadoBooleano
    };
  }

  this.usuarios = [...this.usuarios]; // fuerza render

  Swal.fire({
    icon: 'success',
    title: estadoBooleano ? 'Usuario activado' : 'Usuario desactivado',
    timer: 1500,
    showConfirmButton: false
  });
},
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado'
        });
      }
    });
  });
}




deleteUsuario(usuario: Usuario): void {
  if (!usuario.idUsuario) return;

  Swal.fire({
    title: '¿Eliminar usuario?',
    text: `Se eliminará a ${usuario.nombre}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#9e9e9e',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (!result.isConfirmed) return;

    this.apiService.deleteUsuario(usuario.idUsuario).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.idUsuario !== usuario.idUsuario);
        this.filteredUsuarios = [...this.usuarios];

        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario'
        });
      }
    });
  });
}


  getRolNombre(idRol: number, usuario?: Usuario): string {
    // Si se pasa el usuario directamente, usar su rol primero
    if (usuario && usuario.rol && usuario.rol.nombre) {
      return usuario.rol.nombre;
    }
    
    // Buscar el usuario específico por idRol
    const usuarioEncontrado = usuario || this.usuarios.find(u => u.idRol === idRol);
    if (usuarioEncontrado && usuarioEncontrado.rol && usuarioEncontrado.rol.nombre) {
      return usuarioEncontrado.rol.nombre;
    }
    
    // Si no, buscar en el array de roles cargado
    const rol = this.roles.find(r => r.idRol === idRol);
    if (rol && rol.nombre) {
      return rol.nombre;
    }
    
    return 'Sin rol';
  }

  getNombreCompleto(usuario: Usuario): string {
    const nombre =
      usuario.nombreCompleto ||
      (usuario as any).nombres_completos ||
      (usuario as any).nombresCompletos ||
      usuario.nombre ||
      '';
    return nombre ? String(nombre).trim() : '—';
  }

  getCedula(usuario: Usuario): string {
    const cedula =
      usuario.cedula ||
      (usuario as any).numeroCedula ||
      (usuario as any).cedulaUsuario ||
      '';
    return cedula ? String(cedula) : '—';
  }

 formatDate(fecha?: string | Date): string {
  if (!fecha) {
    return '—';
  }

  const date = new Date(fecha);
  return date.toLocaleDateString('es-EC');
}
updateUsuario(): void {
  if (!this.usuarioEditId) return;

  const payload = {
    nombres_completos: this.nuevoUsuario.nombre,
    cedula: this.nuevoUsuario.cedula,
    estado: this.nuevoUsuario.estado,
    idRol: this.nuevoUsuario.idRol
  };

  if (this.editPasswordTemp) {
    Object.assign(payload, {
      contraseña: this.editPasswordTemp,
      contrasena: this.editPasswordTemp,
      password: this.editPasswordTemp,
      clave: this.editPasswordTemp
    });
  }

  this.apiService.updateUsuario(this.usuarioEditId, payload).subscribe({
    next: (usuarioActualizado) => {
      const index = this.usuarios.findIndex(u => u.idUsuario === this.usuarioEditId);
      if (index !== -1) {
        this.usuarios[index] = usuarioActualizado;
        this.filteredUsuarios = [...this.usuarios];
      }

      this.closeEditModal();

      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'Los datos fueron guardados correctamente',
        timer: 1800,
        showConfirmButton: false
      });
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el usuario'
      });
    }
  });
}

openAddModal(): void {
  this.isEditMode = false;
  this.usuarioEditId = null;

  // Asegurar que la fecha actual esté actualizada
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  const fechaActual = `${year}-${month}-${day}`;
  this.today = fechaActual;

  this.nuevoUsuario = {
    nombre: '',
    nombres_completos: '',
    cedula: '',
    email: '',
    estado: true,
    fechaRegistro: fechaActual,
    idRol: this.roles.length ? this.roles[0].idRol : 0
  };

  this.passwordTemp = '';
  this.showPassword = false;
  this.isCedulaLoading = false;
  this.cedulaError = '';
  this.showAddModal = true;
}

togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}


editUser(usuario: any) {
  console.log('Editar usuario', usuario);
}

deleteUser(id: number) {
  console.log('Eliminar usuario', id);
}


}
