import { Component, Output, EventEmitter, Input } from '@angular/core';
//import { RecetaService } from '../../services/receta.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-formulario-receta',
  imports: [ReactiveFormsModule ],
  templateUrl: './formulario-receta.component.html',
  styleUrl: './formulario-receta.component.css'
})
export class FormularioRecetaComponent{
  @Input() cliCod: string = ''; 
  @Output() cerrar = new EventEmitter<void>();
  @Output() recetaGuardada = new EventEmitter<void>();
  

 recetaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesService
  ) {
    this.recetaForm = this.fb.group({
      recfecha: [new Date().toISOString().split('T')[0], Validators.required],
      OD_SPH: [null, Validators.required],
      OD_CYL: [null, Validators.required],
      OD_eje: [null, Validators.required],
      OI_SPH: [null, Validators.required],
      OI_CYL: [null, Validators.required],
      OI_eje: [null, Validators.required],
      DIP_Lejos: [null, [Validators.required]],
      DIP_Cerca: [null, [Validators.required]],
      adicion: [null]
    });
  }

  enviarReceta() {
    console.log('Formulario de receta:', this.recetaForm.value);
    console.log('Errores en el formulario:', this.recetaForm.errors);

    if (this.recetaForm.invalid) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const datosReceta = {
      cliCod: this.cliCod, 
      recfecha: this.recetaForm.value.recfecha,  
      recOD_sph: this.recetaForm.value.OD_SPH,
      recOD_cyl: this.recetaForm.value.OD_CYL,
      recOD_eje: this.recetaForm.value.OD_eje,
      recOI_sph: this.recetaForm.value.OI_SPH,
      recOI_cyl: this.recetaForm.value.OI_CYL,
      recOI_eje: this.recetaForm.value.OI_eje,
      recDIPLejos: this.recetaForm.value.DIP_Lejos,
      recDIPCerca: this.recetaForm.value.DIP_Cerca,
      rec_adicion: this.recetaForm.value.adicion
    };

    this.clienteService.agregarReceta(datosReceta).subscribe({
      next: (respuesta) => {
        console.log('Receta agregada con éxito', respuesta);
        alert('Receta registrada correctamente');
        this.recetaGuardada.emit(); 
        this.cerrar.emit();  
      },
      error: (error) => {
        console.error('Error al enviar receta', error);
        // Aquí imprimimos detalles más completos del error
        console.error('Detalles del error:', error.error);
        alert('Ocurrió un error al registrar la receta: ' + (error.error || 'Error desconocido'));
      }
    });
  }

  cerrarFormulario() {
    this.cerrar.emit(); // Solo cerrar sin guardar
  }
}
