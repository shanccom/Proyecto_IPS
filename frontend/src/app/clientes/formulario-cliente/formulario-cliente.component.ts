import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { ReactiveFormsModule } from '@angular/forms'; 
import { NotificationService } from '../../services/notification.service'; 
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-formulario-cliente',
  templateUrl: './formulario-cliente.component.html',
  styleUrls: ['./formulario-cliente.component.css'],
  imports: [CommonModule, ReactiveFormsModule] // 👈 Asegúrate de tener CommonModule aquí
})

export class FormularioClienteComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form:FormGroup;
  mensajeError: string | null = null
  mensajeExito: string | null = null;


  constructor(private fb: FormBuilder, private clienteService: ClientesService,private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      nombre_completo: ['', Validators.required],
      tipo_documento: ['', Validators.required],
      numero_documento: ['', Validators.required],
      numero_celular: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(0)]]
    });

    this.notificationService.registerHandler((msg: string, tipo: 'error' | 'success') => {
  console.log('Recibido mensaje:', msg, 'Tipo:', tipo); // 👈 debería verse en consola
  if (tipo === 'error') {
    this.mensajeError = msg;
    setTimeout(() => this.mensajeError = null, 4000);
  } else {
    this.mensajeExito = msg;
    setTimeout(() => this.mensajeExito = null, 4000);
  }
});


  }
  // Funcion para cerrar el formulario
  cerrarFormulario() {
    this.cerrar.emit();
  }
  guardarCliente() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showError('Por favor completa correctamente todos los campos del formulario.');
      return;
    }
    const clienteData = this.form.value;
    console.log('Datos enviados al backend:', clienteData);

    this.clienteService.agregarCliente(clienteData).subscribe(
      () => {
        this.guardado.emit();
        this.cerrarFormulario();
      },
      (error) => {
        console.error('Error al guardar cliente:', error);
        if (error.error) {
          console.error('Detalles del error:', error.error); // Ver más detalles si los hay
        }
      }
    );
    this.notificationService.showSuccess('Cliente guardado exitosamente.');

  }

}
