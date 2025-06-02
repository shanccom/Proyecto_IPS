import { Component, Output, EventEmitter } from '@angular/core';
import { RecetaService } from '../../services/receta.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-formulario-receta',
  imports: [ReactiveFormsModule ],
  templateUrl: './formulario-receta.component.html',
  styleUrl: './formulario-receta.component.css'
})
export class FormularioRecetaComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() recetaGuardada = new EventEmitter<void>();
  

 recetaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private recetaService: RecetaService
  ) {
    this.recetaForm = this.fb.group({
      /*medicion_propia: [false, Validators.required],*/
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      OD_SPH: [null, Validators.required],
      OD_CYL: [null, Validators.required],
      OD_eje: [null, Validators.required],
      OI_SPH: [null, Validators.required],
      OI_CYL: [null, Validators.required],
      OI_eje: [null, Validators.required],
      DIP_Lejos: [null, [Validators.required, Validators.min(45), Validators.max(75)]],
      DIP_Cerca: [null, [Validators.required, Validators.min(45), Validators.max(75)]],
      adicion: [null]
    });
  }

  enviarReceta() {
    if (this.recetaForm.invalid) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const datosReceta = this.recetaForm.value;

    this.recetaService.crearReceta(datosReceta).subscribe({
      next: (respuesta) => {
        console.log('Receta agregada con éxito', respuesta);
        alert('Receta registrada correctamente');
        this.recetaGuardada.emit(); // Notifica al padre que se guardó
        this.cerrar.emit(); // Cierra el formulario/modal
      },
      error: (error) => {
        console.error('Error al enviar receta', error);
        alert('Ocurrió un error al registrar la receta');
      }
    });
  }

  cerrarFormulario() {
    this.cerrar.emit(); // Solo cerrar sin guardar
  }
}
