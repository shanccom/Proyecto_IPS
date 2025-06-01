import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { HttpClientModule } from '@angular/common/http';

type CampoFiltro = 'tipo' | 'marca' | 'material' | 'color' | 'estado';

@Component({
  selector: 'app-inventario-filtros',
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './inventario-filtros.component.html',
  styleUrl: './inventario-filtros.component.css'
})
export class InventarioFiltrosComponent implements OnInit {
  @Output() filtrosAplicados = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  campos: CampoFiltro[] = ['tipo', 'marca', 'material', 'color', 'estado'];

  seleccionados: Record<CampoFiltro, string[]> & { precio: { min: number; max: number } } = {
    tipo: [],
    marca: [],
    material: [],
    color: [],
    estado: [],
    precio: { min: 0, max: 0 }
  };

  desplegar: Record<CampoFiltro, boolean> = {
    tipo: false,
    marca: false,
    material: false,
    color: false,
    estado: false
  };

  opcionesFiltros: Record<CampoFiltro, string[]> = {
    tipo: [],
    marca: [],
    material: [],
    color: [],
    estado: []
  };

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.obtenerOpcionesFiltros().subscribe(
      (data) => {
        console.log('Datos recibidos desde el backend:', data);
        this.opcionesFiltros = {
          tipo: data.tipos || [],
          marca: data.marcas || [],
          material: data.materiales || [],
          color: data.colores || [],
          estado: data.estados || []
        };
      },
      (error) => {
        console.error('Error al obtener filtros:', error);
      }
    );
  }

  toggleDesplegable(campo: CampoFiltro) {
    this.desplegar[campo] = !this.desplegar[campo];
  }

  toggleSeleccion(campo: CampoFiltro, valor: string) {
    const set = new Set(this.seleccionados[campo]);
    set.has(valor) ? set.delete(valor) : set.add(valor);
    this.seleccionados[campo] = Array.from(set);
  }

  aplicar() {
    this.filtrosAplicados.emit({ ...this.seleccionados });
  }

  limpiar() {
    this.seleccionados = {
      tipo: [],
      marca: [],
      material: [],
      color: [],
      estado: [],
      precio: { min: 0, max: 0 }
    };
    this.reset.emit();
  }
}
