import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionTimerService {
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes de expirar
  
  private timerInterval: any;
  private sessionStartTime: number | null = null;
  
  private timeRemainingSubject = new Subject<number>();
  public timeRemaining$: Observable<number> = this.timeRemainingSubject.asObservable();
  
  private warningShown = false;
  private expiredSubject = new Subject<void>();
  public expired$: Observable<void> = this.expiredSubject.asObservable();

  constructor() {
    // Verificar si hay una sesión activa al iniciar
    this.checkExistingSession();
  }

  startSession(): void {
    // Guardar el tiempo de inicio de sesión
    this.sessionStartTime = Date.now();
    localStorage.setItem('sessionStartTime', this.sessionStartTime.toString());
    this.warningShown = false;
    
    // Iniciar el timer
    this.startTimer();
  }

  private checkExistingSession(): void {
    const savedTime = localStorage.getItem('sessionStartTime');
    const token = localStorage.getItem('token');
    
    if (savedTime && token) {
      this.sessionStartTime = parseInt(savedTime, 10);
      const elapsed = Date.now() - this.sessionStartTime;
      
      // Si la sesión ya expiró, cerrar sesión
      if (elapsed >= this.SESSION_DURATION) {
        this.expireSession();
      } else {
        // Continuar con el timer
        this.startTimer();
      }
    }
  }

  private startTimer(): void {
    // Limpiar timer anterior si existe
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Actualizar cada segundo
    this.timerInterval = setInterval(() => {
      if (!this.sessionStartTime) {
        return;
      }

      const elapsed = Date.now() - this.sessionStartTime;
      const remaining = this.SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        this.expireSession();
      } else {
        // Emitir tiempo restante
        this.timeRemainingSubject.next(remaining);

        // Mostrar advertencia si quedan 5 minutos o menos
        if (remaining <= this.WARNING_TIME && !this.warningShown) {
          this.warningShown = true;
        }
      }
    }, 1000);

    // Emitir tiempo inicial
    if (this.sessionStartTime) {
      const elapsed = Date.now() - this.sessionStartTime;
      const remaining = this.SESSION_DURATION - elapsed;
      if (remaining > 0) {
        this.timeRemainingSubject.next(remaining);
      }
    }
  }

  private expireSession(): void {
    this.stopTimer();
    this.expiredSubject.next();
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.sessionStartTime = null;
    localStorage.removeItem('sessionStartTime');
    this.warningShown = false;
  }

  getTimeRemaining(): number {
    if (!this.sessionStartTime) {
      return 0;
    }
    const elapsed = Date.now() - this.sessionStartTime;
    return Math.max(0, this.SESSION_DURATION - elapsed);
  }

  shouldShowWarning(): boolean {
    const remaining = this.getTimeRemaining();
    return remaining <= this.WARNING_TIME && remaining > 0;
  }
}
