import { Component } from '@angular/core';
import { InventarioFiltrosComponent } from './inventario-filtros/inventario-filtros.component'
import { InventarioTablaComponent } from './inventario-tabla/inventario-tabla.component';

@Component({
  selector: 'app-inventario',
  imports: [  InventarioFiltrosComponent,InventarioTablaComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent {
  // corregir
  productos = [
    { codigo: 'P001', marca: 'Marca A', material: 'Madera', color: 'Rojo', precio: 100, estado: 'Disponible' },
    { codigo: 'P002', marca: 'Marca B', material: 'Plástico', color: 'Verde', precio: 150, estado: 'Vendido' },
    { codigo: 'P003', marca: 'Marca C', material: 'Metal', color: 'Azul', precio: 200, estado: 'Disponible' },
    
  ];

  productosFiltrados = [...this.productos];

  filtros = {
    marca: '',
    material: '',
    color: '',
    precio: { min: null, max: null },
    estado: ''
  };

// Métodos
  aplicarFiltros(filtrosAplicados: any) {
    this.filtros = { ...this.filtros, ...filtrosAplicados };
    this.productosFiltrados = this.productos.filter(producto => {
      return (
        (this.filtros.marca ? producto.marca.includes(this.filtros.marca) : true) &&
        (this.filtros.material ? producto.material.includes(this.filtros.material) : true) &&
        (this.filtros.color ? producto.color.includes(this.filtros.color) : true) &&
        (this.filtros.precio.min !== null ? producto.precio >= this.filtros.precio.min : true) &&
        (this.filtros.precio.max !== null ? producto.precio <= this.filtros.precio.max : true) &&
        (this.filtros.estado ? producto.estado === this.filtros.estado : true)
      );
    });
  }

  resetFiltros() {
    this.filtros = {
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
