import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { ReactiveFormsModule } from '@angular/forms'; 
import { Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';


@Component({
  standalone: true,
  selector: 'app-formulario-montura',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formulario-montura.component.html',
  styleUrl: './formulario-montura.component.css'
})
export class FormularioMonturaComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;
  mostrarError = false;

  opcionesMarcas: string[] = [];
  opcionesPublicos: string[] = [];
  opcionesMateriales: string[] = [];
  opcionesColores: string[] = [];

  mostrarInputMarcaOtro = false;
  mostrarInputPublOtro = false;
  mostrarInputMateOtro = false;
  mostrarInputColorOtro = false;

  constructor(private fb: FormBuilder, private inventarioService: InventarioService, private authService: AuthService) {
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

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.inventarioService.obtenerOpcionesFiltros('montura').subscribe(data => {
        this.opcionesMarcas = data.marcas;
        this.opcionesPublicos = data.publicos;
        this.opcionesMateriales = data.materiales;
        this.opcionesColores = data.colores;
      });
    }

  }

  onSelectCambio(campo: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    switch (campo) {
      case 'marca':
        this.mostrarInputMarcaOtro = value === 'otro';
        break;
      case 'publ':
        this.mostrarInputPublOtro = value === 'otro';
        break;
      case 'mate':
        this.mostrarInputMateOtro = value === 'otro';
        break;
      case 'color':
        this.mostrarInputColorOtro = value === 'otro';
        break;
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.mostrarError = true;
      this.form.markAllAsTouched();
      return;
    }

    this.mostrarError = false;
    const montura = this.form.value;
    montura.proTipo = 'Montura';

    this.inventarioService.crearMontura(montura).subscribe(() => {
      this.guardado.emit();
      this.cerrar.emit();
    });
  }
}