import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, duration = 3000): void {
    this.showNotification({ message, type: 'success', duration });
  }

  showError(message: string, duration = 5000): void {
    this.showNotification({ message, type: 'error', duration });
  }

  showInfo(message: string, duration = 3000): void {
    this.showNotification({ message, type: 'info', duration });
  }

  showWarning(message: string, duration = 4000): void {
    this.showNotification({ message, type: 'warning', duration });
  }

  private showNotification(notification: Notification): void {
    this.notificationSubject.next(notification);
    
    this.snackBar.open(notification.message, 'Fermer', {
      duration: notification.duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`${notification.type}-snackbar`],
      politeness: 'assertive'
    });
  }
} 