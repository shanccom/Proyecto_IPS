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
  @ViewChild('barcode', { static: true }) barcodeElement!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnChanges(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.value && this.barcodeElement) {
        JsBarcode(this.barcodeElement.nativeElement, this.value, {
          displayValue: true,
        });
      }
    }
  }
}