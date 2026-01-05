import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionTimerService } from '../../services/session-timer.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-session-timer',
  standalone: false,
  templateUrl: './session-timer.component.html',
  styleUrls: ['./session-timer.component.scss']
})
export class SessionTimerComponent implements OnInit, OnDestroy {
  timeRemaining: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  displayTime: string = '30:00';
  isWarning: boolean = false;
  isAuthenticated: boolean = false;
  
  private subscription?: Subscription;
  private warningShown: boolean = false;

  constructor(
    private sessionTimerService: SessionTimerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (!this.isAuthenticated) {
      return;
    }

    // Suscribirse a los cambios de tiempo restante
    this.subscription = this.sessionTimerService.timeRemaining$.subscribe(time => {
      this.timeRemaining = time;
      this.updateDisplay();
      
      // Mostrar advertencia cuando queden 5 minutos o menos
      if (this.sessionTimerService.shouldShowWarning() && !this.warningShown) {
        this.showWarning();
      }
    });

    // Suscribirse a cuando la sesión expire
    this.sessionTimerService.expired$.subscribe(() => {
      this.showExpirationAlert();
    });

    // Inicializar display
    this.updateDisplay();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateDisplay(): void {
    this.minutes = Math.floor(this.timeRemaining / 60000);
    this.seconds = Math.floor((this.timeRemaining % 60000) / 1000);
    
    // Formatear como MM:SS
    this.displayTime = `${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
    
    // Activar advertencia visual si quedan 5 minutos o menos
    this.isWarning = this.sessionTimerService.shouldShowWarning();
  }

  private showWarning(): void {
    this.warningShown = true;
    
    const timeText = this.minutes > 0 
      ? `${this.minutes} minuto${this.minutes > 1 ? 's' : ''}`
      : `${this.seconds} segundo${this.seconds !== 1 ? 's' : ''}`;
    
    Swal.fire({
      title: '⏱️ Sesión por expirar',
      html: `Su sesión expirará en <strong>${timeText}</strong>.<br><br>Por favor, guarde su trabajo.`,
      icon: 'warning',
      confirmButtonColor: '#ff6f00',
      confirmButtonText: 'Entendido',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-logout-popup',
        confirmButton: 'swal-logout-confirm'
      }
    });
  }

  private showExpirationAlert(): void {
    Swal.fire({
      title: 'Sesión expirada',
      text: 'Su sesión ha expirado por seguridad. Será redirigido al inicio de sesión.',
      icon: 'info',
      confirmButtonColor: '#0d47a1',
      confirmButtonText: 'Entendido',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-logout-popup',
        confirmButton: 'swal-logout-info-confirm'
      }
    }).then(() => {
      this.authService.logout();
    });
  }
}
