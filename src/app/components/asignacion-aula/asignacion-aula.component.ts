import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-asignacion-aula',
  standalone: false,
  templateUrl: './asignacion-aula.component.html',
  styleUrls: ['./asignacion-aula.component.scss']
})
export class AsignacionAulaComponent implements OnInit {
  currentUser = 'Ing Edison';
  
  // Información Básica
  nombreDocente: string = '';
  nombreAula: string = '';
  
  // Recursos Físicos
  cantidadSillas: number = 0;
  cantidadMesas: number = 0;
  cantidadComputadoras: number = 0;
  
  // Toggle Laboratorio
  esLaboratorio: boolean = false;

  ngOnInit(): void {
  }

  incrementarRecurso(tipo: string): void {
    if (tipo === 'computadoras' && !this.esLaboratorio) {
      return; // Bloquear si no es laboratorio
    }
    
    switch(tipo) {
      case 'sillas':
        this.cantidadSillas++;
        break;
      case 'mesas':
        this.cantidadMesas++;
        break;
      case 'computadoras':
        if (this.esLaboratorio) {
          this.cantidadComputadoras++;
        }
        break;
    }
  }

  decrementarRecurso(tipo: string): void {
    if (tipo === 'computadoras' && !this.esLaboratorio) {
      return; // Bloquear si no es laboratorio
    }
    
    switch(tipo) {
      case 'sillas':
        if (this.cantidadSillas > 0) this.cantidadSillas--;
        break;
      case 'mesas':
        if (this.cantidadMesas > 0) this.cantidadMesas--;
        break;
      case 'computadoras':
        if (this.esLaboratorio && this.cantidadComputadoras > 0) {
          this.cantidadComputadoras--;
        }
        break;
    }
  }

  toggleLaboratorio(): void {
    this.esLaboratorio = !this.esLaboratorio;
    // Si se desactiva el laboratorio, resetear computadoras a 0
    if (!this.esLaboratorio) {
      this.cantidadComputadoras = 0;
    }
  }

  registrarAsignacion(): void {
    if (this.nombreDocente && this.nombreAula) {
      const asignacion = {
        docente: this.nombreDocente,
        aula: this.nombreAula,
        sillas: this.cantidadSillas,
        mesas: this.cantidadMesas,
        computadoras: this.cantidadComputadoras,
        esLaboratorio: this.esLaboratorio
      };
      
      console.log('Asignación registrada:', asignacion);
      // Aquí puedes agregar la lógica para guardar la asignación
      
      // Resetear formulario
      this.nombreDocente = '';
      this.nombreAula = '';
      this.cantidadSillas = 0;
      this.cantidadMesas = 0;
      this.cantidadComputadoras = 0;
      this.esLaboratorio = false;
      
      alert('Asignación registrada exitosamente');
    } else {
      alert('Por favor complete los campos obligatorios');
    }
  }
}

