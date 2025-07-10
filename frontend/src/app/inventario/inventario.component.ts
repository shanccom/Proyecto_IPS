import { Component, OnInit } from '@angular/core';
import { InventarioFiltrosComponent } from './inventario-filtros/inventario-filtros.component'
import { InventarioTablaComponent } from './inventario-tabla/inventario-tabla.component';
import { InventarioService } from '../services/inventario.service';
import { CommonModule } from '@angular/common'; 
import { FormularioAccesorioComponent } from './formulario-accesorio/formulario-accesorio.component';
import { FormularioMonturaComponent } from './formulario-montura/formulario-montura.component';
import { AuthService } from '../services/auth.service';
import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { BarcodeComponent } from '../shared/barcode/barcode.component';

type TipoFormulario = 'montura' | 'accesorio';

@Component({
  selector: 'app-inventario',
  imports: [  
    InventarioFiltrosComponent, 
    InventarioTablaComponent, 
    CommonModule,
    FormularioAccesorioComponent,
    FormularioMonturaComponent,
    BarcodeComponent
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
  
  //
  modalCodigoVisible: boolean = false; 
  codigoProducto: string = '';       
  constructor(private inventarioService: InventarioService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
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
  }


  filtros: any = {
    tipo: [],
    marca: [],
    material: [],
    color: [],
    publico:[],
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
    const publicoFiltro = (filtrosAplicados.publico || []).map((v: string) => v.toLowerCase());
    const estadoFiltro = (filtrosAplicados.estado || []).map((v: string) => v.toLowerCase());
    // Filtrar precio mínimo y máximo (asegurándonos que los valores sean números)
    const precioMinFiltro = filtrosAplicados.precio?.min ?? null;
    const precioMaxFiltro = filtrosAplicados.precio?.max ?? null;
      

    //console.log('Filtros recibidos: ', filtrosAplicados);
    if (this.authService.isAuthenticated()) {
      this.productosFiltrados = this.productos.filter(producto => {
        const tipoProducto = (producto.tipo || '').toLowerCase();
        const marcaProducto = (producto.marca || '').toLowerCase();
        const materialProducto = (producto.material || '').toLowerCase();
        const colorProducto = (producto.color || '').toLowerCase();
        const publicoProducto = (producto.publico || '').toLowerCase();
        const estadoProducto = (producto.estado || '').toLowerCase(); 
        const precio = Number(producto.precio) ?? 0;


        const tipoPasa = tiposFiltro.length === 0 || tiposFiltro.includes(tipoProducto);
        const marcaPasa = marcaFiltro.length === 0 || marcaFiltro.includes(marcaProducto);
        const materialPasa = materialFiltro.length === 0 || materialFiltro.includes(materialProducto);
        const colorPasa = colorFiltro.length === 0 || colorFiltro.includes(colorProducto);
        const estadoPasa = estadoFiltro.length === 0 || estadoFiltro.includes(estadoProducto);
        const publicoPasa = publicoFiltro.length===0 || publicoFiltro.includes(publicoProducto);
        // Filtrar por precios
        const precioMinPasa = (precioMinFiltro == null || precio >= precioMinFiltro);
        const precioMaxPasa = (precioMaxFiltro == null || precio <= precioMaxFiltro);
        
        const pasaFiltro = tipoPasa && marcaPasa && materialPasa && colorPasa && precioMinPasa && precioMaxPasa &&publicoPasa   && estadoPasa;
        //console.log(`Producto: ${producto.nombre} | Estado: ${producto.estado} => pasa: ${pasaFiltro}`);
        
        return pasaFiltro;
      });
    }

    //console.log('Productos filtrados:', this.productosFiltrados);
  }


  
  resetFiltros() {
    //this.productosFiltrados = [...this.productos];
    this.filtrarPorTipoActual();
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
    this.filtrarPorTipoActual();
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
        //this.productosFiltrados = [...this.productos];
        this.filtrarPorTipoActual();

      },
      (error) => {
        console.error("Error al refrescar productos:", error);
      }
    );
    
  }
  filtrarPorTipoActual(){
    
    this.productosFiltrados = this.productos.filter(
      producto => (producto.tipo ||  '').toLowerCase() === this.tipoFormulario 
    );
    console.log(`Filtrando por tipo: ${this.tipoFormulario}`);
    console.log('Productos filtrados:', this.productosFiltrados);
  }

  // PARTE DE CODIGO DE BARRAS
  mostrarCodigoBarras(producto: any): void {
    console.log('Producto recibido:', producto); // Debug
    this.codigoProducto = producto.codigo; // o producto.codigo_barras
    this.modalCodigoVisible = true;
  }

  
  downloadPDF() {
    const doc = new jsPDF();
    const barcodeComponent = document.querySelector('app-barcode');
    const svg = barcodeComponent?.querySelector('svg');
    
    if (svg) {
      // Obtener dimensiones de la página PDF (formato A4 por defecto)
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Configurar para que ocupe la mitad de la hoja
      const targetWidth = pageWidth / 2;  // Mitad del ancho de la página
      const targetHeight = pageHeight / 4; // Un cuarto de la altura
      
      // Centrar horizontalmente
      const xPosition = (pageWidth - targetWidth) / 2;
      const yPosition = 30; // Margen desde arriba
      
      svg2pdf(svg as SVGElement, doc, {
        x: xPosition,
        y: yPosition,
        width: targetWidth,
        height: targetHeight
      }).then(() => {
        doc.save("codigo-barras.pdf");
      }).catch(error => {
        console.error("Error al insertar SVG en el PDF:", error);
        doc.save("codigo-barras.pdf");
      });
    } else {
      console.error("No se encontró el SVG del código de barras.");
      doc.save("codigo-barras.pdf");
    }
  }

  generatePDFConTodosLosCodigos() {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    const barcodeDivs = document.querySelectorAll('#barcodes-hidden > div');

    const anchoPagina = doc.internal.pageSize.getWidth();
    const anchoCodigo = 300; // ancho del código de barras
    const altoCodigo = 120;   // alto del código de barras

    const xCentrado = (anchoPagina - anchoCodigo) / 2;
    const margenSuperior = 80;
    const espacioEntreCodigos = 130;

    const renderizarCodigo = async (div: Element, posY: number) => {
      const svg = div.querySelector('svg') as SVGSVGElement | null;
      if (svg) {
        svg.setAttribute("width", `${anchoCodigo}`);
        svg.setAttribute("height", `${altoCodigo}`);

        await svg2pdf(svg, doc, {
          x: xCentrado,
          y: margenSuperior + posY * espacioEntreCodigos,
        });
      }
    };

    const renderTodos = async () => {
      for (let i = 0; i < barcodeDivs.length; i++) {
        const posY = i % 4;

        await renderizarCodigo(barcodeDivs[i], posY);

        if ((i + 1) % 4 === 0 && i < barcodeDivs.length - 1) {
          doc.addPage();
        }
      }

      doc.save("TodosLosCodigos.pdf");
    };

    renderTodos();
  }
}
