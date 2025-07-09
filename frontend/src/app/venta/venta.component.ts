import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScannerComponent } from '../shared/scanner/scanner.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { VentasService, Producto } from '../services/ventas.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';  
import { ReniecService, PersonaReniec } from '../services/reniec.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [RouterModule, ScannerComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})

export class VentaComponent implements OnInit {
  ventaForm: FormGroup;
  formularioLunaPersonalizada: FormGroup;
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

  consultandoDni = false;
  dniEncontrado = false;
  datosPersona: PersonaReniec | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private ventaService: VentasService,
    private reniecService: ReniecService
  ) {
    this.ventaForm = this.createForm();
    this.formularioLunaPersonalizada = this.createFormularioLuna();
  }

  ngOnInit(): void {
    this.generarNuevoCorrelativo();
    this.calcularTotalesCompletos();
    this.setupDniWatcher();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  createFormularioLuna(): FormGroup {
    return this.fb.group({
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      valor_unitario: [0, [Validators.required, Validators.min(0.01)]]
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

  // AGREGAR LUNA PERSONALIZADA
  agregarLunaPersonalizada() {
    if (this.formularioLunaPersonalizada.valid) {
      const formValue = this.formularioLunaPersonalizada.value;
      
      // Crear FormGroup para producto personalizado
      const itemPersonalizado = this.fb.group({
        producto_id: [null], // Sin producto_id para productos personalizados
        codigo: ['Producto personalizado'],
        descripcion: [formValue.descripcion, Validators.required],
        cantidad: [formValue.cantidad, [Validators.required, Validators.min(1)]],
        valor_unitario: [formValue.valor_unitario, [Validators.required, Validators.min(0.01)]],
        subtotal: [{ value: formValue.cantidad * formValue.valor_unitario, disabled: true }],
        stock_disponible: [{ value: 999, disabled: true }] // Stock alto para personalizados
      });

      this.items.push(itemPersonalizado);
      this.calcularSubtotal(this.items.length - 1);
      this.formularioLunaPersonalizada.reset({ cantidad: 1, valor_unitario: 0 });
      
      console.log('Luna personalizada agregada:', formValue.descripcion);
    } else {
      alert('Completa todos los campos para agregar una luna personalizada.');
    }
  }

  guardarBoleta() {
    const cliente = this.ventaForm.get('cliente')?.getRawValue();
    const productosForm = this.items.controls;

    console.log('Cliente:', cliente); // DEBUG: Ver qué datos hay

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

    const boletaRequest = {
      serie: this.ventaForm.get('serie')?.value,
      cliente: {
        tipo_doc: cliente.tipo_doc,
        num_doc: cliente.num_doc,
        rzn_social: cliente.rzn_social
      },
      items: itemsParaEnviar.map(item => {
        if (!item.producto_id || item.producto_id === 0) {
          // Producto personalizado (como una luna)
          return {
            producto_id: null, // Agregamos producto_id como null
            codigo: item.codigo || 'LUNA-CUSTOM',
            descripcion: item.nombre || item.descripcion || 'Producto personalizado',
            cantidad: item.cantidad,
            valor_unitario: item.valor_unitario
          };
        } else {
          // Producto normal
          return {
            producto_id: item.producto_id,
            codigo: item.codigo,
            descripcion: item.descripcion, // Agregamos descripción también
            cantidad: item.cantidad,
            valor_unitario: item.valor_unitario
          };
        }
      }),
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
    
    // Solo validar stock para productos normales (con producto_id)
    const tieneProductoId = item.get('producto_id')?.value;
    if (tieneProductoId && cantidad > stockDisponible) {
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

  /**
   * Configura el observador para cambios automáticos en el DNI
   */
  private setupDniWatcher() {
    const dniControl = this.ventaForm.get('cliente.num_doc');
    const tipoDocControl = this.ventaForm.get('cliente.tipo_doc');
    
    if (dniControl && tipoDocControl) {
      dniControl.valueChanges.pipe(
        debounceTime(800), // Espera 800ms después del último cambio
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe(numDoc => {
        // Solo consultar si es tipo DNI (valor '1') y tiene 8 dígitos
        if (tipoDocControl.value === '1' && numDoc && numDoc.length === 8 && /^\d{8}$/.test(numDoc)) {
          this.consultarDniReniec(numDoc);
        } else {
          this.limpiarDatosReniec();
        }
      });
    }
  }

  /**
   * Maneja el input del DNI (llamado desde el template)
   */
  onDniInput(event: any) {
    const dni = event.target.value;
    
    // Solo permitir números
    const soloNumeros = dni.replace(/\D/g, '');
    if (dni !== soloNumeros) {
      this.ventaForm.get('cliente.num_doc')?.setValue(soloNumeros);
    }
    
    // Limpiar datos si no tiene 8 dígitos
    if (soloNumeros.length !== 8) {
      this.limpiarDatosReniec();
    }
  }

  /**
   * Maneja el cambio de tipo de documento
   */
  onTipoDocumentoChange() {
    this.ventaForm.get('cliente.num_doc')?.setValue('');
    this.ventaForm.get('cliente.rzn_social')?.setValue('');
    this.limpiarDatosReniec();
  }

  /**
   * Buscar DNI manualmente (botón)
   */
  buscarPorDni() {
    const dni = this.ventaForm.get('cliente.num_doc')?.value;
    if (dni && dni.length === 8) {
      this.consultarDniReniec(dni);
    }
  }

  /**
   * Consulta el DNI en RENIEC
   */
  private consultarDniReniec(dni: string) {
    this.consultandoDni = true;
    this.dniEncontrado = false;

    console.log(`Consultando DNI en RENIEC: ${dni}`);

    this.reniecService.consultarDni(dni).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (persona: PersonaReniec) => {
        console.log('DNI encontrado en RENIEC:', persona);
        
        this.datosPersona = persona;
        this.dniEncontrado = true;
        this.consultandoDni = false;
        
        // Llenar el campo de razón social con el nombre completo
        this.ventaForm.get('cliente.rzn_social')?.setValue(persona.nombreCompleto);
        this.ventaForm.get('cliente.rzn_social')?.disable(); // Deshabilitar edición
        
        // Opcional: mostrar notificación de éxito
        this.mostrarNotificacion('DNI encontrado en RENIEC', 'success');
      },
      error: (error) => {
        console.error('Error al consultar DNI:', error);
        
        this.consultandoDni = false;
        this.dniEncontrado = false;
        this.datosPersona = null;
        
        // Mostrar error al usuario
        this.mostrarNotificacion(error.message || 'Error al consultar DNI', 'error');
      }
    });
  }

  /**
   * Limpia los datos obtenidos de RENIEC
   */
  private limpiarDatosReniec() {
    this.dniEncontrado = false;
    this.datosPersona = null;
    
    // Si el campo estaba deshabilitado, habilitarlo
    if (this.ventaForm.get('cliente.rzn_social')?.disabled) {
      this.ventaForm.get('cliente.rzn_social')?.enable();
      this.ventaForm.get('cliente.rzn_social')?.setValue('');
    }
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
  }
}