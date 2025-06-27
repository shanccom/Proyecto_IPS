import { Component, Output, EventEmitter, Input, OnInit, OnChanges , SimpleChanges} from '@angular/core';
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
export class FormularioRecetaComponent implements OnInit, OnChanges{
  @Input() cliCod: string = ''; 
  @Input() recetaEditar?: any;
  @Output() cerrar = new EventEmitter<void>();
  @Output() recetaGuardada = new EventEmitter<void>();
  

  recetaForm!: FormGroup;
  modoEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recetaEditar'] && this.recetaEditar) {

      this.modoEdicion = true;

      if (!this.recetaForm) {
        this.inicializarFormulario();
      }

      setTimeout(() => {
        this.llenarFormulario(this.recetaEditar);
      });
    }
  }
  inicializarFormulario(): void {
    this.recetaForm = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      medicion_propia: [false],
      OD_SPH: [''],
      OD_CYL: [''],
      OD_eje: [''],
      OI_SPH: [''],
      OI_CYL: [''],
      OI_eje: [''],
      DIP_Lejos: [''],
      DIP_Cerca: [''],
      adicion: ['']
    });
  }

  llenarFormulario(receta: any): void {
    this.recetaForm.patchValue({
      fecha: receta.fecha,
      medicion_propia: receta.medicion_propia,
      OD_SPH: receta.OD_SPH,
      OD_CYL: receta.OD_CYL,
      OD_eje: receta.OD_eje,
      OI_SPH: receta.OI_SPH,
      OI_CYL: receta.OI_CYL,
      OI_eje: receta.OI_eje,
      DIP_Lejos: receta.DIP_Lejos,
      DIP_Cerca: receta.DIP_Cerca,
      adicion: receta.adicion
    });
  }


  enviarReceta() {

    if (this.recetaForm.invalid) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const datosReceta = {
      cliCod: this.cliCod, 
      fecha: this.recetaForm.value.fecha,  
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

    if (this.modoEdicion && this.recetaEditar?.codigo) {
      this.clienteService.actualizarReceta(this.recetaEditar.codigo , datosReceta).subscribe({
        next: (respuesta) => {
          console.log('Receta actualizada con exito', respuesta);
          alert('Receta actualizada correctamente');
          this.recetaGuardada.emit();
          this.cerrar.emit();
        },
        error: (error) => {
          console.error('Error al actualizar receta', error);
          alert('Ocurrio un error al actualizar la receta: ' + (error.error || 'Error desconocido'));
        }
      });

    }else{
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

    
  }

  cerrarFormulario() {
    this.cerrar.emit(); 
  }
}
