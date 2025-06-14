import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  private defaultDuration = 5000;

  constructor(private snackBar: MatSnackBar) {}

  show(alert: Alert): void {
    const config: MatSnackBarConfig = {
      duration: alert.duration || this.defaultDuration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`alert-${alert.type}`]
    };

    this.snackBar.open(alert.message, alert.action, config);
    this.alertSubject.next(alert);
  }

  success(message: string, duration?: number): void {
    this.show({
      type: 'success',
      message,
      duration
    });
  }

  error(message: string, duration?: number): void {
    this.show({
      type: 'error',
      message,
      duration: duration || 10000 // Longer duration for errors
    });
  }

  warning(message: string, duration?: number): void {
    this.show({
      type: 'warning',
      message,
      duration
    });
  }

  info(message: string, duration?: number): void {
    this.show({
      type: 'info',
      message,
      duration
    });
  }

  getAlerts(): Observable<Alert> {
    return this.alertSubject.asObservable();
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }
} 