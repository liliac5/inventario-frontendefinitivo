import { Component, OnInit } from '@angular/core';

interface Item {
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  estado: string;
}

@Component({
  selector: 'app-inventario',
  standalone: false,
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {
  currentUser = 'Ing Edison';
  searchTerm: string = '';
  showAddModal: boolean = false;
  showDetailModal: boolean = false;
  selectedItem: Item | null = null;
  
  // Estadísticas
  totalAulas: number = 15;
  totalDocentes: number = 48;
  totalBienes: number = 1250;
  
  items: Item[] = [
    { codigo: 'A-101', nombre: 'Aula Magna (Cap. 100)', tipo: 'Aula', ubicacion: 'Edificio A, Planta Baja', estado: 'Operativo' },
    { codigo: 'A-205', nombre: 'Laboratorio de Química', tipo: 'Aula', ubicacion: 'Edificio A, Nivel 2', estado: 'Operativo' },
    { codigo: 'B-301', nombre: 'Aula Regular 301', tipo: 'Aula', ubicacion: 'Edificio B, Nivel 3', estado: 'Mantenimiento' },
    { codigo: 'D0045', nombre: 'Dr. Javier Ruiz González', tipo: 'Docente', ubicacion: 'Ingeniería de Sistemas', estado: 'Titular' },
    { codigo: 'D0098', nombre: 'Lic. Ana María Solano', tipo: 'Docente', ubicacion: 'Administración', estado: 'Asociado' },
    { codigo: 'D0150', nombre: 'MSc. Carlos Varela', tipo: 'Docente', ubicacion: 'Matemáticas', estado: 'Contratado' },
    { codigo: 'INV-123', nombre: 'Proyector Epson X3', tipo: 'Bienes', ubicacion: 'A-101', estado: 'Asignado' },
    { codigo: 'INV-456', nombre: 'Silla de Oficina (Rodante)', tipo: 'Bienes', ubicacion: 'Almacén', estado: 'Disponible' }
  ];

  filteredItems: Item[] = [];

  // Formulario para nuevo elemento
  nuevoItem: Item = {
    codigo: '',
    nombre: '',
    tipo: 'Bienes',
    ubicacion: '',
    estado: ''
  };

  tipos: string[] = ['Bienes', 'Aula', 'Docente'];
  ubicaciones: string[] = ['Edificio A, Planta Baja', 'Edificio A, Nivel 2', 'Edificio B, Nivel 3', 'Almacén', 'Ingeniería de Sistemas', 'Administración', 'Matemáticas'];
  estados: string[] = ['Operativo', 'Mantenimiento', 'Disponible', 'Asignado', 'Titular', 'Asociado', 'Contratado'];
  
  // Filtros
  showFilterDropdown: boolean = false;
  selectedFilter: string = 'Mostrar Todos';
  filterOptions: string[] = [
    'Mostrar Todos',
    'Aulas / Laboratorios',
    'Docentes',
    'Bienes (Activos)',
    'Mantenimiento',
    'Titular',
    'Asociado',
    'Contratado',
    'Asignado',
    'Disponible'
  ];

  ngOnInit(): void {
    this.filteredItems = [...this.items];
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.filter-dropdown-wrapper')) {
        this.showFilterDropdown = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.items];

    // Aplicar búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term) ||
        item.tipo.toLowerCase().includes(term) ||
        item.ubicacion.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro seleccionado
    if (this.selectedFilter !== 'Mostrar Todos') {
      if (this.selectedFilter === 'Aulas / Laboratorios') {
        filtered = filtered.filter(item => item.tipo === 'Aula');
      } else if (this.selectedFilter === 'Docentes') {
        filtered = filtered.filter(item => item.tipo === 'Docente');
      } else if (this.selectedFilter === 'Bienes (Activos)') {
        filtered = filtered.filter(item => item.tipo === 'Bienes');
      } else {
        filtered = filtered.filter(item => item.estado === this.selectedFilter);
      }
    }

    this.filteredItems = filtered;
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.showFilterDropdown = false;
    this.applyFilters();
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  openAddModal(): void {
    this.nuevoItem = {
      codigo: '',
      nombre: '',
      tipo: 'Bienes',
      ubicacion: '',
      estado: ''
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveItem(): void {
    if (this.nuevoItem.codigo && this.nuevoItem.nombre && 
        this.nuevoItem.ubicacion && this.nuevoItem.estado) {
      this.items.push({...this.nuevoItem});
      this.applyFilters();
      this.closeAddModal();
    }
  }

  viewDetails(item: Item): void {
    this.selectedItem = item;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedItem = null;
  }
}

