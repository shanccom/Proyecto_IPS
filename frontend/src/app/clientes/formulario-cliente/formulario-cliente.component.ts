import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { ReactiveFormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-formulario-cliente',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-cliente.component.html',
  styleUrl: './formulario-cliente.component.css'
})
export class FormularioClienteComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form:FormGroup;

  constructor(private fb: FormBuilder, private clienteService: ClientesService) {
    this.form = this.fb.group({
      nombre_completo: [''],
      tipo_documento: [''],  
      numero_documento: [''],
      numero_celular: [''],
      edad: ['']

    });
  }
  // Funcion para cerrar el formulario
  cerrarFormulario() {
    this.cerrar.emit();
  }
  guardarCliente() {
    if (this.form.invalid) {
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
  }

}