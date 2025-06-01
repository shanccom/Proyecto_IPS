import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { ReactiveFormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-formulario-luna',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-luna.component.html',
  styleUrl: './formulario-luna.component.css'
})

export class FormularioLunaComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      proNombre: ['', Validators.required],
      proCosto: [0, [Validators.required, Validators.min(0)]],
      proPrecioVenta: [0, [Validators.required, Validators.min(0)]],
      lunaProp: ['', Validators.required],
      lunaMat: ['', Validators.required],
      lunaColorHalo: ['', Validators.required]
    });
  }

  guardar() {
    if (this.form.valid) {
      this.http.post('http://localhost:8000/lunas/', this.form.value).subscribe({
        next: () => {
          this.guardado.emit();
          this.cerrar.emit();
        },
        error: (error) => {
          console.error('Error guardando luna:', error);
          alert('Error guardando la luna');
        }
      });
    } else {
      alert('Por favor completa todos los campos correctamente.');
    }
  }
}