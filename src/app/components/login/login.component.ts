import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  cedula: string = '';
  password: string = '';
  selectedRole: number = 1; // 1=Admin, 2=Coordinador, 3=Docente, 4=Usuario
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  particles = Array(10).fill(0).map((_, i) => i + 1);

  roleOptions = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Coordinador' },
    { id: 3, name: 'Docente' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
  this.errorMessage = '';

  if (!this.cedula || !this.password) {
    this.errorMessage = 'Por favor, ingrese cédula y contraseña';
    return;
  }

  const cedulaRegex = /^\d{10}$/;
  if (!cedulaRegex.test(this.cedula)) {
    this.errorMessage = 'Por favor, ingrese una cédula válida';
    return;
  }

  this.isLoading = true;

  this.authService.login(this.cedula, this.password).subscribe({
    next: (usuario) => {
      console.log('Login exitoso, usuario:', usuario);
      this.isLoading = false;

      const rol = usuario.idRol;
      console.log('Rol del usuario:', rol);

      if (rol === 1 || rol === 2) {
        this.router.navigate(['/inventario']);
      } 
      else if (rol === 3) {
        this.router.navigate(['/portal-docente']);
      } 
      else {
        // Si el rol no es reconocido, redirigir al login o inventario por defecto
        console.warn('Rol no reconocido, redirigiendo a inventario');
        this.router.navigate(['/inventario']);
      }
    },
    error: (error) => {
      console.error('Error en login:', error);
      this.isLoading = false;
      
      // Mensaje de error más descriptivo
      if (error.error && error.error.message) {
        this.errorMessage = error.error.message;
      } else if (error.status === 401 || error.status === 403) {
        this.errorMessage = 'Cédula o contraseña incorrectos';
      } else if (error.status === 0) {
        this.errorMessage = 'No se pudo conectar con el servidor. Verifique que el backend esté corriendo.';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      }
    }
  });
}

}
