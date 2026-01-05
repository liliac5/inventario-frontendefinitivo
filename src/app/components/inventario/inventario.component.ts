import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { BienesService } from '../../services/bienes.service';
import { CategoriasService } from '../../services/categorias.service';
import { AulasService } from '../../services/aulas.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {

  // 👤 Usuario
  currentUser: string = 'Administrador';

  // 🆕 Nuevo bien
  nuevoBien: any = {
  codigoBien: '',
  nombreBien: '',
  tipoBien: '',
  claseBien: '',
  cuentaTipoBien: '',
  codigoInventario: '',
  codigoSecap: '',
  descripcion: '',
  especificaciones: '',
  marca: '',
  modelo: '',
  serie: '',
  valorCompraInicial: null,
  valorConIva: null,
  estado: '',
  detalleEstado: '',
  custodio: '',
  ubicacion: '',
  provincia: '',
  observaciones: '',
  observaciones2: '',
  origen: 'INVENTARIO',
  categoria: {
    idCategoria: null
  },
};
    aulas: any[] = [];

// Aulas asignadas a usuarios (SOLO ACTIVAS)
aulasAsignadas: {
  idAula: number;
  nombreAula: string;
  nombreUsuario: string;
}[] = [];

// Para mostrar el usuario seleccionado
usuarioAulaSeleccionada: string = '';

  // 📊 Contadores
  totalBienes = 0;
  totalCategorias = 0;
  bienesDisponibles = 0;
  bienesAsignados = 0;

  // 🔽 Filtros
  selectedFilter: string = 'Mostrar todos';
  showFilterDropdown = false;
  selectedBien: any = {
  categoria: { idCategoria: null },
  aula: { idAula: null }
};

  filterOptions: string[] = [
    'Mostrar todos',
    'Disponible',
    'Asignado',
    'En Mantenimiento',
    'Dañado',
    'Baja'
  ];

  // 📋 Datos
  bienes: any[] = [];
  filteredBienes: any[] = [];
  categorias: any[] = [];

  // 🪟 Modales
  showAddModal = false;
  showCategoryModal = false;
  showDetailModal = false;

  searchTerm = '';

  nuevaCategoria: any = { nombre: '' };

  constructor(
    private bienesService: BienesService,
    private categoriasService: CategoriasService,
      private aulasService: AulasService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener usuario y establecer currentUser según el rol
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
    }
    
    this.loadBienes();
    this.loadCategorias();
      this.loadAulas();
      this.loadAulasAsignadas();

  }
resetForm() {
  this.nuevoBien = {
    codigoBien: '',
    nombreBien: '',
    tipoBien: '',
    claseBien: '',
    cuentaTipoBien: '',
    codigoInventario: '',
    codigoSecap: '',
    descripcion: '',
    especificaciones: '',
    marca: '',
    modelo: '',
    serie: '',
    valorCompraInicial: null,
    valorConIva: null,
    estado: '',
    detalleEstado: '',
    custodio: '',
    ubicacion: '',
    provincia: '',
    observaciones: '',
    observaciones2: '',
    origen: 'INVENTARIO',
    categoria: { idCategoria: null },
    aula: { idAula: null }
  };
}

  // 📦 Cargar bienes
  loadBienes() {
    this.bienesService.getAll().subscribe(data => {
      this.bienes = data;
      this.filteredBienes = data;
      this.totalBienes = data.length;
    });
  }

  // 📂 Cargar categorías
  loadCategorias() {
    this.categoriasService.getAll().subscribe(data => {
      this.categorias = data;
      this.totalCategorias = data.length;
    });
  }

  // 🏷️ Nombre categoría
  getCategoriaNombre(categoria: any): string {
    return categoria?.nombre || 'Sin categoría';
  }

  // 🔍 Buscar
  onSearch() {
    this.applyFilters();
  }

  // ➕ Modal Bien
  openAddModal() {
    this.resetForm();   // 👈 ESTO ES LO CLAVE

    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
      this.resetForm();
  }

  // ✅ Validar bien
 validarBien(): boolean {
  const b = this.nuevoBien;

  if (
    !b.codigoBien ||
    !b.nombreBien ||
    !b.tipoBien ||
    !b.claseBien ||
    !b.cuentaTipoBien ||
    !b.codigoInventario ||
    !b.codigoSecap ||
    !b.estado ||
    !b.ubicacion ||
    !b.provincia ||
    !b.valorCompraInicial ||
    !b.valorConIva ||
    !b.categoria.idCategoria
  ) {
    Swal.fire(
      'Campos incompletos',
      'Todos los campos obligatorios deben ser llenados',
      'warning'
    );
    return false;
  }

  return true;
}

loadAulas() {
  this.aulasService.getAll().subscribe(data => {
    this.aulas = data;
  });
}

  // 💾 Guardar bien
saveBien() {
  if (!this.validarBien()) return;

  this.bienesService.create(this.nuevoBien).subscribe({
    next: () => {
      Swal.fire('Éxito', 'Bien registrado correctamente', 'success');
      this.closeAddModal();
      this.loadBienes();
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', err.error?.message || 'No se pudo guardar', 'error');
    }
  });
}


  // 👁️ Detalles
openEditModal(bien: any) {

  this.selectedBien = JSON.parse(JSON.stringify(bien));

  // 🔥 ASEGURAR CATEGORIA
  if (!this.selectedBien.categoria) {
    this.selectedBien.categoria = { idCategoria: null };
  }

  // 🔥 ASEGURAR AULA
  if (!this.selectedBien.aula) {
    this.selectedBien.aula = { idAula: null };
  }

  this.showDetailModal = true;
}
  closeDetailModal() {
    this.showDetailModal = false;
  }

  // 🗑️ Eliminar
  deleteBien(bien: any) {
    Swal.fire({
      title: '¿Eliminar bien?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.bienesService.delete(bien.idBien).subscribe(() => {
          Swal.fire('Eliminado', 'Bien eliminado', 'success');
          this.loadBienes();
        });
      }
    });
  }

  // 📂 Categoría
  openCategoryModal() {
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
  }

  saveCategoria() {
    if (!this.nuevaCategoria.nombre) {
      Swal.fire('Atención', 'Ingrese el nombre de la categoría', 'warning');
      return;
    }

    this.categoriasService.create(this.nuevaCategoria).subscribe(() => {
      Swal.fire('Éxito', 'Categoría creada', 'success');
      this.nuevaCategoria = { nombre: '' };
      this.closeCategoryModal();
      this.loadCategorias();
    });
  }

  // 🔽 Filtros
  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectFilter(option: string) {
    this.selectedFilter = option;
    this.showFilterDropdown = false;
    this.applyFilters();
  }

  applyFilters() {
    const texto = this.searchTerm.toLowerCase();

    this.filteredBienes = this.bienes.filter(b =>
      (
        b.codigoBien?.toLowerCase().includes(texto) ||
        b.nombreBien?.toLowerCase().includes(texto) ||
        b.descripcion?.toLowerCase().includes(texto)
      ) &&
      (
        this.selectedFilter === 'Mostrar todos' ||
        b.estado === this.selectedFilter
      )
    );
  }
  updateBien() {
  this.bienesService.update(this.selectedBien.idBien, this.selectedBien)
    .subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Bien actualizado correctamente', 'success');
        this.showDetailModal = false;
        this.loadBienes();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el bien', 'error');
      }
    });
}
loadAulasAsignadas(): void {
  this.apiService.getAsignaciones().subscribe({
    next: (asignaciones: any[]) => {
      this.aulasAsignadas = asignaciones
        .filter(a => a.estado === true)
        .map(a => ({
          idAula: a.aula.idAula,
          nombreAula: `${a.aula.nombre} - ${a.aula.ubicacion}`,
          nombreUsuario: a.usuario.nombre
        }));
    },
    error: () => {
      console.error('Error cargando asignaciones');
    }
  });
}
onAulaSeleccionada(idAula: number | null): void {
  if (!idAula) {
    this.usuarioAulaSeleccionada = '';
    return;
  }

  const aula = this.aulasAsignadas.find(a => a.idAula === idAula);
  this.usuarioAulaSeleccionada = aula ? aula.nombreUsuario : '';
  
  // Auto-completar custodio si está vacío
  if (this.showAddModal && !this.nuevoBien.custodio) {
    this.nuevoBien.custodio = this.usuarioAulaSeleccionada;
  } else if (this.showDetailModal && !this.selectedBien.custodio) {
    this.selectedBien.custodio = this.usuarioAulaSeleccionada;
  }
}

}
