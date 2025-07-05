import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; 
import { InventarioService } from '../../services/inventario.service';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-formulario-accesorio',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario-accesorio.component.html',
  styleUrl: './formulario-accesorio.component.css'
})
export class FormularioAccesorioComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private inventarioService: InventarioService) {
    this.form = this.fb.group({
      accNombre: ['', Validators.required],
      accDescrip: [''],
      proCosto: [0,[Validators.required, Validators.min(0.01)]],
      proPrecioVenta: [0,[Validators.required, Validators.min(0.01)]],
    });
  }

  guardar() {
    if (this.form.valid) {
      const accesorio = this.form.value;
      this.inventarioService.crearAccesorio(accesorio).subscribe(() => {
        this.guardado.emit();
        this.cerrar.emit();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}