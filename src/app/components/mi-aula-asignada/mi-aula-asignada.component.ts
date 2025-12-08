import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-aula-asignada',
  standalone: false,
  templateUrl: './mi-aula-asignada.component.html',
  styleUrls: ['./mi-aula-asignada.component.scss']
})
export class MiAulaAsignadaComponent implements OnInit {
  currentUser = 'Melanie Cruz';
  aulaAsignada = 'A-301';

  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  irAlFormulario(): void {
    this.router.navigate(['/portal-docente']);
  }
}

