import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; 


@Component({
  selector: 'app-formulario-accesorio',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-accesorio.component.html',
  styleUrl: './formulario-accesorio.component.css'
})
export class FormularioAccesorioComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      proNombre: ['', Validators.required],
      proCosto: [0, [Validators.required, Validators.min(0)]],
      proPrecioVenta: [0, [Validators.required, Validators.min(0)]],
      accDescrip: ['']
    });
  }

  guardar() {
    if (this.form.valid) {
      this.http.post('http://localhost:8000/accesorios/', this.form.value).subscribe({
        next: () => {
          this.guardado.emit();
          this.cerrar.emit();
        },
        error: (error) => {
          console.error('Error guardando accesorio:', error);
          alert('Error guardando el accesorio');
        }
      });
    } else {
      alert('Por favor completa todos los campos correctamente.');
    }
  }
}