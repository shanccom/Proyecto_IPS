import { Component, OnInit } from '@angular/core';
import { InventarioFiltrosComponent } from './inventario-filtros/inventario-filtros.component'
import { InventarioTablaComponent } from './inventario-tabla/inventario-tabla.component';
import { InventarioService } from '../services/inventario.service';
import { CommonModule } from '@angular/common'; 
import { FormularioAccesorioComponent } from './formulario-accesorio/formulario-accesorio.component';
import { FormularioMonturaComponent } from './formulario-montura/formulario-montura.component';

type TipoFormulario = 'montura' | 'accesorio';

@Component({
  selector: 'app-inventario',
  imports: [  
    InventarioFiltrosComponent, 
    InventarioTablaComponent, 
    CommonModule,
    FormularioAccesorioComponent,
    FormularioMonturaComponent
    ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  //boton
  modalVisible = false;
  tipoFormulario: TipoFormulario = 'montura'; 
  
  //

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


  filtros: any = {
    tipo: [],
    marca: [],
    material: [],
    color: [],
    estado: [],
    precio: { min: null, max: null }
  };

// Métodos
   // Aplicar filtros
  aplicarFiltros(filtrosAplicados: any) {
    // Convertimos el filtro de tipo a minúsculas
    const tiposFiltro = (filtrosAplicados.tipo || []).map((v: string) => v.toLowerCase());
    const marcaFiltro = (filtrosAplicados.marca || []).map((v: string) => v.toLowerCase());
    const materialFiltro = (filtrosAplicados.material || []).map((v: string) => v.toLowerCase());
    const colorFiltro = (filtrosAplicados.color || []).map((v: string) => v.toLowerCase());
    

    console.log('Filtros recibidos:', tiposFiltro);
    this.productosFiltrados = this.productos.filter(producto => {
      const tipoProducto = (producto.tipo || '').toLowerCase();
      const marcaProducto = (producto.marca || '').toLowerCase();
      const materialProducto = (producto.material || '').toLowerCase();
      const colorProducto = (producto.color || '').toLowerCase();
      const precio = producto.proPrecioVenta ?? 0;


      const tipoPasa = tiposFiltro.length === 0 || tiposFiltro.includes(tipoProducto);
      const marcaPasa = marcaFiltro.length === 0 || marcaFiltro.includes(marcaProducto);
      const materialPasa = materialFiltro.length === 0 || materialFiltro.includes(materialProducto);
      const colorPasa = colorFiltro.length === 0 || colorFiltro.includes(colorProducto);
      const precioMinPasa = this.filtros.precio.min == null || precio >= this.filtros.precio.min;
      const precioMaxPasa = this.filtros.precio.max == null || precio <= this.filtros.precio.max;

      const pasaFiltro = tipoPasa && marcaPasa && materialPasa && colorPasa && precioMinPasa && precioMaxPasa

      console.log(`Producto: ${producto.nombre} | Tipo: ${producto.tipo} => pasa: ${pasaFiltro}`);
      
      return pasaFiltro;
    });

    console.log('Productos filtrados:', this.productosFiltrados);
  }


  
  resetFiltros() {
    this.productosFiltrados = [...this.productos];
  }

    
  editar(producto: any) {
    console.log('Editar producto:', producto);
  }

  eliminar(codigo: string) {
    this.inventarioService.eliminarMontura(codigo ).subscribe(
      (data) => {
        this.refrescarProductos();
      },
      (error) => {
        console.error('Error al eliminar productos:', error);
      }
    );
    
  }
  //Metodos Boton
  seleccionarFormulario(tipo: string){
    this.tipoFormulario = tipo as any;
  }


  abrirModal(tipo: string) {
    this.modalVisible = true; 
    this.tipoFormulario = tipo as any;
  }

  cerrarModal() {
    this.modalVisible = false;
  }
  refrescarProductos() {
    console.log("Refrescando productos");
    this.inventarioService.obtenerProductos().subscribe(
      (data) => {
        this.productos = data; 
        this.productosFiltrados = [...this.productos];

      },
      (error) => {
        console.error("Error al refrescar productos:", error);
      }
    );
    
  }

}
