import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { ReactiveFormsModule } from '@angular/forms'; 
import { Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-formulario-montura',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario-montura.component.html',
  styleUrl: './formulario-montura.component.css'
})
export class FormularioMonturaComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;
  mostrarError = false;


  constructor(private fb: FormBuilder, private inventarioService: InventarioService) {
    this.form = this.fb.group({
      proCosto: [0, [Validators.required, Validators.min(0.01)]],
      proPrecioVenta: [0, [Validators.required, Validators.min(0.01)]],
      monMarca: ['', Validators.required],
      monPubl: ['', Validators.required],
      monMate: ['', Validators.required],
      monColor: ['', Validators.required],
      monVendida: [false, Validators.required]
    });
  }

  guardar() {
    
    if (this.form.invalid) {

      console.log("denro", this.mostrarError);
      this.mostrarError = true;
      this.form.markAllAsTouched(); // muestra errores en los campos
      return;
    }
    console.log("despues mostrar error", this.mostrarError);
    this.mostrarError = false; 

    const montura = this.form.value;
    montura.proTipo = 'Montura';

    this.inventarioService.crearMontura(montura).subscribe(() => {
      this.guardado.emit();
      this.cerrar.emit();
    });
  }
}