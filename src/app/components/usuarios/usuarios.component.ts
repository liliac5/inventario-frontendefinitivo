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
    email: '',
    estado: true,
    fechaRegistro: '',
    idRol: 0
  };

  passwordTemp = '';
  showPassword = false;
  isEditMode: boolean = false;
  usuarioEditId: number | null = null;

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
      next: usuarios => {
        console.log('Usuarios recibidos del backend:', usuarios);
        // Log detallado de cada usuario
        usuarios.forEach((usuario, index) => {
          console.log(`Usuario ${index + 1}:`, {
            nombre: usuario.nombre,
            idRol: usuario.idRol,
            rol: usuario.rol,
            rolNombre: usuario.rol?.nombre
          });
        });
        this.usuarios = usuarios;
        this.filteredUsuarios = [...usuarios];
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
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      this.getRolNombre(u.idRol).toLowerCase().includes(term)
    );
  }

  openEditModal(usuario: Usuario): void {
  this.usuarioEditId = usuario.idUsuario;

  this.nuevoUsuario = {
    nombre: usuario.nombre,
    email: usuario.email,
    estado: usuario.estado,
    idRol: usuario.idRol
  };

  this.showEditModal = true;
}

closeEditModal(): void {
  this.showEditModal = false;
  this.usuarioEditId = null;
}

  closeAddModal(): void {
    this.showAddModal = false;
  }

saveUsuario(): void {
  if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.passwordTemp || !this.nuevoUsuario.idRol) {
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

  const usuario: Usuario = {
    idUsuario: 0,
    nombre: this.nuevoUsuario.nombre,
    email: this.nuevoUsuario.email,
    contraseña: this.passwordTemp,
    estado: this.nuevoUsuario.estado ?? true,
    fechaRegistro: fechaActual,
    idRol: this.nuevoUsuario.idRol!
  };

  this.apiService.createUsuario(usuario).subscribe({
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
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el usuario',
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
    nombre: this.nuevoUsuario.nombre,
    email: this.nuevoUsuario.email,
    estado: this.nuevoUsuario.estado,
    idRol: this.nuevoUsuario.idRol
  };

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
    email: '',
    estado: true,
    fechaRegistro: fechaActual,
    idRol: this.roles.length ? this.roles[0].idRol : 0
  };

  this.  passwordTemp = '';
  this.showPassword = false;
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
