import { Component, OnInit } from '@angular/core';
import { InventarioFiltrosComponent } from './inventario-filtros/inventario-filtros.component'
import { InventarioTablaComponent } from './inventario-tabla/inventario-tabla.component';
import { InventarioService } from '../services/inventario.service';

@Component({
  selector: 'app-inventario',
  imports: [  InventarioFiltrosComponent,InventarioTablaComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  
  productos: any[] = [];
  productosFiltrados: any[] = [];
  
  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.obtenerProductos().subscribe(
      (data) => {
        console.log('Datos recibidos desde el backend:', data);
        this.productos = data;
        this.productosFiltrados = [...data];
      },
      (error) => {
        console.error('Error al obtener productos:', error);
      }
    );
  }


  filtros = {
    tipo: [] as string[],
    marca: [] as string[],
    material: [] as string[],
    color: [] as string[],
    precio: { min: null as number | null, max: null as number | null },
    estado: [] as string[]
  };

// Métodos
   // Aplicar filtros
  aplicarFiltros(filtrosAplicados: any) {
    this.filtros = { ...this.filtros, ...filtrosAplicados };

    this.productosFiltrados = this.productos.filter(producto => {
      return (
        (this.filtros.tipo.length === 0 || this.filtros.tipo.includes(producto.tipo)) &&
        (this.filtros.marca.length === 0 || this.filtros.marca.includes(producto.marca)) &&
        (this.filtros.material.length === 0 || this.filtros.material.includes(producto.material)) &&
        (this.filtros.color.length === 0 || this.filtros.color.includes(producto.color)) &&
        (this.filtros.precio.min === null || producto.proCosto >= this.filtros.precio.min) &&
        (this.filtros.precio.max === null || producto.proPrecioVenta <= this.filtros.precio.max) &&
        (this.filtros.estado.length === 0 || this.filtros.estado.includes(producto.estado))
      );
    });
  }

  resetFiltros() {
    this.filtros = {
      tipo: [],
      marca: [],
      material: [],
      color: [],
      precio: { min: null, max: null },
      estado: []
    };
    this.productosFiltrados = [...this.productos];
  }

    
  editar(producto: any) {
    console.log('Editar producto:', producto);
  }

  eliminar(codigo: string) {
    this.productos = this.productos.filter(p => p.codigo !== codigo);
    this.productosFiltrados = this.productosFiltrados.filter(p => p.codigo !== codigo);
  }

}
