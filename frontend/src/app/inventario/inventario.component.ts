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


  // Filtros
  filtros = {
    tipo: '',
    marca: '',
    material: '',
    color: '',
    precio: { min: null, max: null },
    estado: ''
  };

// Métodos
   // Aplicar filtros
  aplicarFiltros(filtrosAplicados: any) {
    this.filtros = { ...this.filtros, ...filtrosAplicados };

    this.productosFiltrados = this.productos.filter(producto => {
      return (
        (this.filtros.tipo ? producto.tipo.includes(this.filtros.tipo) : true) &&  // Filtra por tipo
        (this.filtros.marca ? producto.marca.includes(this.filtros.marca) : true) &&  // Filtra por marca
        (this.filtros.material ? producto.material.includes(this.filtros.material) : true) &&  // Filtra por material
        (this.filtros.color ? producto.color.includes(this.filtros.color) : true) &&  // Filtra por color
        (this.filtros.precio.min !== null ? producto.proCosto >= this.filtros.precio.min : true) &&  // Filtra por precio mínimo
        (this.filtros.precio.max !== null ? producto.proPrecioVenta <= this.filtros.precio.max : true) &&  // Filtra por precio máximo
        (this.filtros.estado ? producto.estado === this.filtros.estado : true)  // Filtra por estado
      );
    });
  }
  resetFiltros() {
    this.filtros = {
      tipo: '',
      marca: '',
      material: '',
      color: '',
      precio: { min: null, max: null },
      estado: ''
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
