import { Component, OnInit } from '@angular/core';

interface Usuario {
  cedula: string;
  nombres: string;
  apellidos: string;
  rol: string;
  fechaRegistro: string;
  activo: boolean;
  password?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  currentUser = 'Ing Edison';
  searchTerm: string = '';
  showAddModal: boolean = false;
  
  usuarios: Usuario[] = [
    { cedula: '1789653254', nombres: 'Esteven', apellidos: 'Cumbe', rol: 'Usuario', fechaRegistro: '4/8/2025', activo: true },
    { cedula: '1751051176', nombres: 'Edison', apellidos: 'Allalco', rol: 'Coordinador', fechaRegistro: '3/8/2025', activo: true },
    { cedula: '1716238348', nombres: 'Rodolfo', apellidos: 'Pozo', rol: 'Admin', fechaRegistro: '26/7/2025', activo: true },
    { cedula: '1712265501', nombres: 'Carlos', apellidos: 'Ponce', rol: 'Admin', fechaRegistro: '26/7/2025', activo: true }
  ];

  filteredUsuarios: Usuario[] = [];

  nuevoUsuario: Usuario = {
    cedula: '',
    nombres: '',
    apellidos: '',
    rol: 'Usuario',
    fechaRegistro: '',
    activo: true,
    password: ''
  };

  roles: string[] = ['Admin', 'Coordinador', 'Usuario'];

  ngOnInit(): void {
    this.filteredUsuarios = [...this.usuarios];
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(usuario =>
      usuario.cedula.toLowerCase().includes(term) ||
      usuario.nombres.toLowerCase().includes(term) ||
      usuario.apellidos.toLowerCase().includes(term) ||
      usuario.rol.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.nuevoUsuario = {
      cedula: '',
      nombres: '',
      apellidos: '',
      rol: 'Usuario',
      fechaRegistro: '',
      activo: true,
      password: ''
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveUsuario(): void {
    if (this.nuevoUsuario.cedula && this.nuevoUsuario.nombres && 
        this.nuevoUsuario.apellidos && this.nuevoUsuario.fechaRegistro && 
        this.nuevoUsuario.password) {
      this.usuarios.push({...this.nuevoUsuario});
      this.filteredUsuarios = [...this.usuarios];
      this.closeAddModal();
    }
  }

  toggleEstado(usuario: Usuario): void {
    usuario.activo = !usuario.activo;
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.nombres} ${usuario.apellidos}?`)) {
      const index = this.usuarios.findIndex(u => u.cedula === usuario.cedula);
      if (index > -1) {
        this.usuarios.splice(index, 1);
        this.filteredUsuarios = [...this.usuarios];
      }
    }
  }
}

