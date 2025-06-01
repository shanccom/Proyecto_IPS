import { Component, Output, EventEmitter, OnInit,Input, SimpleChanges,OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { HttpClientModule } from '@angular/common/http';

type CampoFiltro = 'marca' | 'material' | 'color' | 'estado' | 'publico';

@Component({
  selector: 'app-inventario-filtros',
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './inventario-filtros.component.html',
  styleUrl: './inventario-filtros.component.css'
})
export class InventarioFiltrosComponent implements OnInit, OnChanges {
  @Output() filtrosAplicados = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();
  @Input() tipo: 'montura' | 'accesorio' = 'montura';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipo']) {
      this.cargarFiltros();
    }
  }

  campos: CampoFiltro[] = [ 'marca', 'material','publico', 'color', 'estado'];

  seleccionados: Record<CampoFiltro, string[]> & { precio: { min: number; max: number } } = {
    marca: [],
    material: [],
    publico:[],
    color: [],
    estado: [],
    precio: { min: 0, max: 0 }
  };

  desplegar: Record<CampoFiltro, boolean> = {
    marca: false,
    material: false,
    publico:false,
    color: false,
    estado: false
  };

  opcionesFiltros: Record<CampoFiltro, string[]> = {
    marca: [],
    material: [],
    publico:[],
    color: [],
    estado: []
  };

  constructor(private inventarioService: InventarioService) {}
  marcasMontura: string[] = [];
  publicos: string[] = [];
  materiales: string[] = [];
  colores: string[] = [];


  ngOnInit(): void {
    this.cargarFiltros();
  }

  private cargarFiltros(): void {
    this.inventarioService.obtenerOpcionesFiltros(this.tipo).subscribe((res) => {
      if (this.tipo === 'montura') {
        this.campos = ['marca', 'material', 'publico', 'color', 'estado'];
        this.opcionesFiltros.marca = res.marcas;
        this.opcionesFiltros.publico = res.publicos;
        this.opcionesFiltros.material = res.materiales;
        this.opcionesFiltros.color = res.colores;
        this.opcionesFiltros.estado = ['Vendido', 'No vendido'];
      } else if (this.tipo === 'accesorio') {
        this.campos = []; // No mostramos checkboxes
        this.opcionesFiltros = {
          marca: [],
          material: [],
          publico: [],
          color: [],
          estado: []
        };
      }

      this.seleccionados.precio.min = res.precio_min;
      this.seleccionados.precio.max = res.precio_max;
    });
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
      marca: [],
      material: [],
      publico:[],
      color: [],
      estado: [],
      precio: { min: 0, max: 0 }
    };
    this.reset.emit();
  }
}
