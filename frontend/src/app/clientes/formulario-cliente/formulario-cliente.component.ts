import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-formulario-cliente',
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormularioClienteComponent implements OnInit {
  @Output() cerrarFormularioEvent = new EventEmitter<void>();
  form!: FormGroup;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesService,
    private notificationService: NotificationService
  ) {
    // Registrar handler para mostrar notificaciones
    this.notificationService.registerHandler((msg: string, tipo: 'error' | 'success') => {
      if (tipo === 'error') {
        this.mensajeError = msg;
        setTimeout(() => this.mensajeError = null, 4000);
      } else {
        this.mensajeExito = msg;
        setTimeout(() => this.mensajeExito = null, 4000);
      }
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre_completo: ['', Validators.required],
      tipo_documento: ['', Validators.required],
      numero_documento: ['', Validators.required],
      numero_celular: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]]
    });
  }

  guardarCliente(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showError('Por favor completa correctamente todos los campos del formulario.');
      return;
    }

    this.clienteService.agregarCliente(this.form.value).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cliente guardado exitosamente.');
        this.form.reset();
      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          const mensajes = this.procesarErrores(error.error);
          mensajes.forEach(msg => this.notificationService.showError(msg));
        } else {
          this.notificationService.showError('Error inesperado al guardar el cliente.');
        }
      }
    });
  }

  private procesarErrores(errores: any): string[] {
    const mensajes: string[] = [];
    for (const campo in errores) {
      if (errores.hasOwnProperty(campo)) {
        const detalle = errores[campo];
        if (Array.isArray(detalle)) {
          detalle.forEach((msg: string) => mensajes.push(`${campo}: ${msg}`));
        } else {
          mensajes.push(`${campo}: ${detalle}`);
        }
      }
    }
    return mensajes;
  }

  cerrarFormulario(): void {
    this.cerrarFormularioEvent.emit();
  }
}