import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScannerComponent } from '../shared/scanner/scanner.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Interfaces de ayuda
interface Cliente {
  tipo_doc: string;
  num_doc: string;
  rzn_social: string;
}

interface ItemVenta {
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  subtotal?: number;
}

interface BoletaGuardada {
  id: string;
  serie: string;
  correlativo: string;
  fecha_emision: string;
  cliente: Cliente;
  items: ItemVenta[];
  total: number;
  estado: 'pendiente' | 'enviada';
}

interface ProductoEscaneado {
  codigo: string;
  nombre: string;
  tipo: 'Montura' | 'Luna' | 'Accesorio';
  precio: number;
  stock?: number;
}

@Component({
  selector: 'app-venta',
  imports: [RouterModule, ScannerComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})

export class VentaComponent implements OnInit {
  ventaForm: FormGroup;
  mostrarScanner = false;
  boletasGuardadas: BoletaGuardada[] = [];
  
  // Simulación de base de datos de productos (esto vendría de tu backend)
  productosDB: ProductoEscaneado[] = [
    { codigo: '7891234567890', nombre: 'Montura Metal Zetti Clásica', tipo: 'Montura', precio: 150.00, stock: 5 },
    { codigo: '7891234567891', nombre: 'Montura Acetato Ferioni Premium', tipo: 'Montura', precio: 180.00, stock: 3 },
    { codigo: '7891234567892', nombre: 'Luna Blue Policarbonato', tipo: 'Luna', precio: 80.00, stock: 10 },
    { codigo: '7891234567893', nombre: 'Luna Fotocromática Resina', tipo: 'Luna', precio: 120.00, stock: 8 },
    { codigo: '7891234567894', nombre: 'Estuche Premium Cuero', tipo: 'Accesorio', precio: 25.00, stock: 15 },
    { codigo: '7891234567895', nombre: 'Montura TR Niño Azul', tipo: 'Montura', precio: 95.00, stock: 7 }
  ];

  constructor(private fb: FormBuilder) {
    this.ventaForm = this.createForm();
  }

  ngOnInit(): void {
    this.cargarBoletasGuardadas();
    this.generarNuevoCorrelativo();
  }

  createForm(): FormGroup {
    return this.fb.group({
      serie: ['B001', Validators.required],
      correlativo: ['', Validators.required],
      cliente: this.fb.group({
        tipo_doc: ['1', Validators.required],
        num_doc: ['', [Validators.required, Validators.minLength(8)]],
        rzn_social: ['', Validators.required]
      }),
      items: this.fb.array([])
    });
  }

  createItemForm(producto?: ProductoEscaneado): FormGroup {
    return this.fb.group({
      codigo: [producto?.codigo || '', Validators.required],
      descripcion: [producto?.nombre || '', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      valor_unitario: [producto?.precio || 0, [Validators.required, Validators.min(0.01)]],
      subtotal: [{ value: producto?.precio || 0, disabled: true }],
      stock_disponible: [{ value: producto?.stock || 0, disabled: true }]
    });
  }

  get items(): FormArray {
    return this.ventaForm.get('items') as FormArray;
  }

  // Método llamado desde el scanner
  onCodigoEscaneado(codigo: string): void {
    console.log('Código escaneado:', codigo);
    
    // Buscar producto en la "base de datos"
    const producto = this.productosDB.find(p => p.codigo === codigo);
    
    if (producto) {
      // Verificar si el producto ya está en la lista
      const itemExistente = this.items.controls.findIndex(
        item => item.get('codigo')?.value === codigo
      );

      if (itemExistente !== -1) {
        // Si ya existe, incrementar cantidad
        const item = this.items.at(itemExistente);
        const cantidadActual = item.get('cantidad')?.value || 0;
        const stockDisponible = item.get('stock_disponible')?.value || 0;
        
        if (cantidadActual < stockDisponible) {
          item.patchValue({ cantidad: cantidadActual + 1 });
          this.calcularSubtotal(itemExistente);
        } else {
          alert(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
        }
      } else {
        // Si no existe, agregar nuevo item
        const nuevoItem = this.createItemForm(producto);
        this.items.push(nuevoItem);
        this.calcularSubtotal(this.items.length - 1);
      }
      
      this.mostrarScanner = false;
      this.mostrarProductoAgregado(producto);
    } else {
      alert(`Producto con código ${codigo} no encontrado en el inventario.`);
    }
  }

  mostrarProductoAgregado(producto: ProductoEscaneado): void {
    // Mostrar notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <div class="font-semibold">Producto agregado</div>
          <div class="text-sm">${producto.nombre}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  abrirScanner(): void {
    this.mostrarScanner = true;
  }

  cerrarScanner(): void {
    this.mostrarScanner = false;
  }

  eliminarItem(index: number): void {
    this.items.removeAt(index);
    this.calcularTotales();
  }

  calcularSubtotal(index: number): void {
    const item = this.items.at(index);
    const cantidad = item.get('cantidad')?.value || 0;
    const valorUnitario = item.get('valor_unitario')?.value || 0;
    const stockDisponible = item.get('stock_disponible')?.value || 0;
    
    // Validar que no exceda el stock
    if (cantidad > stockDisponible) {
      item.patchValue({ cantidad: stockDisponible });
      alert(`No puede exceder el stock disponible (${stockDisponible} unidades)`);
      return;
    }
    
    const subtotal = cantidad * valorUnitario;
    item.get('subtotal')?.setValue(subtotal);
    this.calcularTotales();
  }

  calcularTotales(): void {
    // Método para futuros cálculos adicionales (IGV, descuentos, etc.)
  }

  get total(): number {
    return this.items.controls.reduce((total, item) => {
      return total + (item.get('subtotal')?.value || 0);
    }, 0);
  }

  guardarBoleta(): void {
    if (this.ventaForm.invalid) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    if (this.items.length === 0) {
      alert('Debe agregar al menos un producto a la venta.');
      return;
    }

    const fechaEmision = new Date().toISOString().slice(0, -1) + '-05:00';
    
    const boleta: BoletaGuardada = {
      id: this.generateId(),
      serie: this.ventaForm.get('serie')?.value,
      correlativo: this.ventaForm.get('correlativo')?.value,
      fecha_emision: fechaEmision,
      cliente: this.ventaForm.get('cliente')?.value,
      items: this.items.value.map((item: any) => ({
        codigo: item.codigo,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        valor_unitario: item.valor_unitario
      })),
      total: this.total,
      estado: 'pendiente'
    };

    if (typeof window !== 'undefined') {
      this.boletasGuardadas.push(boleta);
      localStorage.setItem('boletas_guardadas', JSON.stringify(this.boletasGuardadas));
      
      alert('Boleta guardada correctamente. Disponible para envío a SUNAT.');
      this.limpiarFormulario();
  }

  }

  limpiarFormulario(): void {
    // Limpiar formulario pero mantener serie
    const serieActual = this.ventaForm.get('serie')?.value;
    this.ventaForm.reset();
    this.ventaForm.patchValue({ serie: serieActual });
    
    // Limpiar array de items
    while (this.items.length > 0) {
      this.items.removeAt(0);
    }
    
    // Generar nuevo correlativo
    this.generarNuevoCorrelativo();
  }

  generarNuevoCorrelativo(): void {
    const serieActual = this.ventaForm.get('serie')?.value || 'B001';
    const boletasSerie = this.boletasGuardadas.filter(b => b.serie === serieActual);
    const ultimoCorrelativo = boletasSerie.length > 0 
      ? Math.max(...boletasSerie.map(b => parseInt(b.correlativo)))
      : 0;
    
    this.ventaForm.patchValue({
      correlativo: (ultimoCorrelativo + 1).toString().padStart(6, '0')
    });
  }

  cargarBoletasGuardadas(): void {
    const boletasStorage = localStorage.getItem('boletas_guardadas');
    if (boletasStorage) {
      this.boletasGuardadas = JSON.parse(boletasStorage);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Método para uso manual (si quieren agregar producto sin scanner)
  buscarProductoPorCodigo(): void {
    const codigo = prompt('Ingrese el código del producto:');
    if (codigo) {
      this.onCodigoEscaneado(codigo);
    }
  }

  get boletasPendientes(): number {
    return this.boletasGuardadas.filter(b => b.estado === 'pendiente').length;
  }

  handleScan(event: any): void {
    console.log('Código escaneado:', event);
    // Aquí haces algo con el valor escaneado
  }


}