import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { ReactiveFormsModule } from '@angular/forms'; 


@Component({
  selector: 'app-formulario-montura',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-montura.component.html',
  styleUrl: './formulario-montura.component.css'
})
export class FormularioMonturaComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private inventarioService: InventarioService) {
    this.form = this.fb.group({
      proNombre: [''],
      proCosto: [0],
      proPrecioVenta: [0],
      monMarca: [''],
      monPubl: [''],
      monMate: ['']
    });
  }

  guardar() {
    const montura = this.form.value;
    montura.proTipo = 'Montura';
    this.inventarioService.crearMontura(montura).subscribe(() => {
      this.guardado.emit();
      this.cerrar.emit();
    });
  }
}