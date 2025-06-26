import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private handler: ((message: string, tipo: 'error' | 'success') => void) | null = null;

  registerHandler(fn: (message: string, tipo: 'error' | 'success') => void) {
    this.handler = fn;
  }

  showError(message: string) {
    this.handler?.(message, 'error');
  }

  showSuccess(message: string) {
    this.handler?.(message, 'success');
  }
}

