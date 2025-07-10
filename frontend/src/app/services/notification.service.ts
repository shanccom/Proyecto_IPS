import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Opciones base para todos los toasts
  private baseOpts = {
    toast: true,
    position: 'bottom-end' as SweetAlertPosition,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  };

  private fire(icon: SweetAlertIcon, title: string, text?: string) {
    Swal.fire({
      icon,
      title,
      text,
      ...this.baseOpts
    });
  }

  success(title: string, text?: string) {
    this.fire('success', title, text);
  }

  error(title: string, text?: string) {
    this.fire('error', title, text);
  }

  info(title: string, text?: string) {
    this.fire('info', title, text);
  }

  warning(title: string, text?: string) {
    this.fire('warning', title, text);
  }

  // Nuevo método para confirmaciones
  confirm(options: {
    title: string;
    text: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) {
    Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Sí, enviar',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed && options.onConfirm) {
        options.onConfirm();
      } else if (options.onCancel) {
        options.onCancel();
      }
    });
  }
}
