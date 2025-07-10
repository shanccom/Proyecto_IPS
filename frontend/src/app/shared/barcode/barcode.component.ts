import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnChanges, Input, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barcode.component.html',
  styleUrl: './barcode.component.css'
})
export class BarcodeComponent implements OnChanges {
  @Input() value!: string;
  @Input() paddingStrategy: 'timestamp' | 'zeros' | 'prefix' | 'none' = 'timestamp';
  @Input() minLength: number = 8; // Longitud mínima recomendada
  
  @ViewChild('barcode', { static: true }) barcodeElement!: ElementRef;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnChanges(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.value && this.barcodeElement) {
        this.generateBarcode();
      }
    }
  }
  
  private generateBarcode(): void {
    try {
      const element = this.barcodeElement.nativeElement;
      
      // Preparar código con padding si es necesario
      const processedCode = this.processCode(this.value);
      
      console.log('Código original:', this.value);
      console.log('Código procesado:', processedCode);
      console.log('Longitud:', processedCode.length);
      
      // Configuración optimizada
      JsBarcode(element, processedCode, {
        format: 'CODE128',
        width: 3,
        height: 100,
        displayValue: true,
        text: this.value, // Mostrar código original
        background: '#ffffff',
        lineColor: '#000000',
        margin: 5,
        fontSize: 16,
        textMargin: 5,
        fontOptions: 'bold',
        textAlign: 'center',
        flat: true
      });
      
    } catch (error) {
      console.error('Error generando código de barras:', error);
      // Fallback con formato más simple
      this.generateFallbackBarcode();
    }
  }
  
  private processCode(code: string): string {
    // Si el código ya es suficientemente largo, no hacer nada
    if (code.length >= this.minLength) {
      return code;
    }
    
    switch (this.paddingStrategy) {
      case 'timestamp':
        const timestamp = Date.now().toString().slice(-6);
        return `${code}-${timestamp}`;
      
      case 'zeros':
        return code.padEnd(this.minLength, '0');
      
      case 'prefix':
        return `ITEM-${code}-${new Date().getFullYear()}`;
      
      case 'none':
      default:
        return code;
    }
  }
  
  private generateFallbackBarcode(): void {
    try {
      const element = this.barcodeElement.nativeElement;
      
      // Fallback con CODE39 para códigos cortos
      JsBarcode(element, this.value, {
        format: 'CODE39',
        width: 2,
        height: 80,
        displayValue: true,
        background: '#ffffff',
        lineColor: '#000000',
        margin: 10
      });
      
    } catch (error) {
      console.error('Error en fallback:', error);
      // Mostrar error en el elemento
      const element = this.barcodeElement.nativeElement;
      const ctx = element.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('Error: Código inválido', 10, 25);
    }
  }
  
  // Método público para probar diferentes estrategias
  public testPadding(): void {
    console.log('Pruebas de padding para:', this.value);
    console.log('Timestamp:', this.processCode(this.value));
    
    const originalStrategy = this.paddingStrategy;
    
    this.paddingStrategy = 'zeros';
    console.log('Zeros:', this.processCode(this.value));
    
    this.paddingStrategy = 'prefix';
    console.log('Prefix:', this.processCode(this.value));
    
    this.paddingStrategy = originalStrategy;
  }
}