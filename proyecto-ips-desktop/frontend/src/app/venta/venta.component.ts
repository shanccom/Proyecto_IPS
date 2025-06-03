import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScannerComponent } from '../shared/scanner/scanner.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { VentasService, Producto } from '../services/ventas.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';  

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [RouterModule, ScannerComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})

export class VentaComponent implements OnInit {
  ventaForm: FormGroup;
  mostrarScanner = false;
  
  cargandoProducto = false;
  guardandoBoleta = false;
  
  boletasPendientes = 0;
  codigoBusqueda = '';
  
  fechaActual = new Date();
  subtotalSinIgv = 0;
  igv = 0;
  totalConIgv = 0;
  totalEnLetras = '';
  boletaGuardada = false;

  productos: any[] = [];
  total: number = 0;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentasService
  ) {
    this.ventaForm = this.createForm();
  }

  ngOnInit(): void {
    this.generarNuevoCorrelativo();
    this.calcularTotalesCompletos();
  }

  //PARA ASEGURARNOS DE QUE EL SERVICIO DE SUNAT FUNCIONE DEBE DE TENER ESTA ESTRUCTURA
  createForm(): FormGroup {
    return this.fb.group({
      serie: ['B001', Validators.required],
      correlativo: ['', Validators.required],
      cliente: this.fb.group({
        tipo_doc: ['1', Validators.required],
        num_doc: [''],
        rzn_social: ['']
      }),
      items: this.fb.array([])
    });
  }

  createItemForm(producto?: Producto): FormGroup {
    return this.fb.group({
      producto_id: [producto?.codigo || null, Validators.required],
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

  onCodigoEscaneado(codigo: string): void {
    console.log('Código escaneado:', codigo);
    this.buscarYAgregarProducto(codigo);
  }

  buscarProductoPorCodigo(): void {
    if (!this.codigoBusqueda || this.codigoBusqueda.trim() === '') {
      alert('Por favor, ingrese un código de producto válido.');
      return;
    }
    
    this.buscarYAgregarProducto(this.codigoBusqueda.trim());
    this.codigoBusqueda = ''; // Limpiar el campo después de buscar
  }

  buscarYAgregarProducto(codigo: string): void {
    this.cargandoProducto = true;
    
    this.ventaService.buscarProductoPorCodigo(codigo)
      .pipe(
        catchError(error => {
          console.error('Error al buscar producto:', error);
          if (error.status === 404) {
            alert(`Producto con código ${codigo} no encontrado en el inventario.`);
          } else {
            alert('Error al buscar el producto. Intente nuevamente.');
          }
          return of(null);
        }),
        finalize(() => {
          this.cargandoProducto = false;
        })
      )
      .subscribe(producto => {
        if (producto) {
          this.agregarProductoAlFormulario(producto);
          this.mostrarScanner = false;
          console.log(`Producto agregado: ${producto.nombre}`);
        }
      });
  }

  agregarProductoAlFormulario(producto: Producto): void {
    const itemExistente = this.items.controls.findIndex(
      item => item.get('producto_id')?.value === producto.id
    );

    if (itemExistente !== -1) {
      const item = this.items.at(itemExistente);
      const cantidadActual = item.get('cantidad')?.value || 0;
      const stockDisponible = producto.stock;
      
      if (cantidadActual < stockDisponible) {
        item.patchValue({ cantidad: cantidadActual + 1 });
        this.calcularSubtotal(itemExistente);
      } else {
        alert(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
      }
    } else {
      const nuevoItem = this.createItemForm(producto);
      this.items.push(nuevoItem);
      this.calcularSubtotal(this.items.length - 1);
    }
  }

  guardarBoleta() {
  const cliente = this.ventaForm.get('cliente')?.value;
  const productosForm = this.items.controls;

  if (!cliente.tipo_doc || !cliente.num_doc || !cliente.rzn_social) {
    alert('Por favor, complete los datos del cliente.');
    return;
  }

  if (productosForm.length === 0) {
    alert('Debe agregar al menos un producto.');
    return;
  }

  // Preparar datos en el formato correcto para la API
  const itemsParaEnviar = productosForm.map(control => control.getRawValue());

  // Validar que todos los productos tengan un producto_id válido
  for (const item of itemsParaEnviar) {
    if (!item.producto_id) {
      alert('Error: Hay un producto sin ID válido en la lista. Por favor, revisa los productos agregados.');
      return;
    }
  }

  const boletaRequest = {
    serie: this.ventaForm.get('serie')?.value,
    cliente: {
      tipo_doc: cliente.tipo_doc,
      num_doc: cliente.num_doc,
      rzn_social: cliente.rzn_social
    },
    items: itemsParaEnviar.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      valor_unitario: item.valor_unitario
    })),
    subtotal: this.subtotalSinIgv,
    igv: this.igv,
    total: this.totalConIgv
  };

  this.guardandoBoleta = true;

  this.ventaService.crearBoleta(boletaRequest)
    .pipe(
      catchError(error => {
        console.error('Error al guardar boleta:', error);
        alert('Error al guardar la boleta. Intente nuevamente.');
        return of(null);
      }),
      finalize(() => {
        this.guardandoBoleta = false;
      })
    )
    .subscribe(response => {
      if (response) {
        console.log('Boleta guardada exitosamente:', response);
        alert(`Boleta ${response.serie}-${response.correlativo} guardada exitosamente`);
        this.boletaGuardada = true;
        this.limpiarFormulario();
      }
    });
}


  generarNuevoCorrelativo(): void {
    const serieActual = this.ventaForm.get('serie')?.value || 'B001';
    
    this.ventaService.obtenerSiguienteCorrelativo(serieActual)
      .pipe(
        catchError(error => {
          console.error('Error al obtener correlativo:', error);
          return of({ correlativo: '000001' });
        })
      )
      .subscribe(response => {
        this.ventaForm.patchValue({
          correlativo: response.correlativo
        });
      });
  }

  eliminarItem(index: number): void {
    this.items.removeAt(index);
    this.calcularTotalesCompletos();
  }

  calcularSubtotal(index: number): void {
    const item = this.items.at(index);
    const cantidad = item.get('cantidad')?.value || 0;
    const valorUnitario = item.get('valor_unitario')?.value || 0;
    const stockDisponible = item.get('stock_disponible')?.value || 0;
    
    if (cantidad > stockDisponible) {
      item.patchValue({ cantidad: stockDisponible });
      alert(`No puede exceder el stock disponible (${stockDisponible} unidades)`);
      return;
    }
    
    const subtotal = cantidad * valorUnitario;
    item.get('subtotal')?.setValue(subtotal);
    
    this.calcularTotalesCompletos();
  }

  calcularTotalesCompletos(): void {
    this.subtotalSinIgv = this.items.controls.reduce((total, item) => {
      return total + (item.get('subtotal')?.value || 0);
    }, 0);
    
    this.igv = this.subtotalSinIgv * 0.18;
    this.totalConIgv = this.subtotalSinIgv + this.igv;
    this.totalEnLetras = `${this.totalConIgv.toFixed(2)} SOLES`;
  }

  limpiarFormulario(): void {
    const serieActual = this.ventaForm.get('serie')?.value;
    this.ventaForm.reset();
    this.ventaForm.patchValue({ serie: serieActual });
    
    while (this.items.length > 0) {
      this.items.removeAt(0);
    }
    
    this.subtotalSinIgv = 0;
    this.igv = 0;
    this.totalConIgv = 0;
    this.totalEnLetras = '';
    this.boletaGuardada = false;
    this.fechaActual = new Date();
    
    this.generarNuevoCorrelativo();
  }

  abrirScanner(): void {
    this.mostrarScanner = true;
  }

  cerrarScanner(): void {
    this.mostrarScanner = false;
  }

  onEnterPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.buscarProductoPorCodigo();
    }
  }
}