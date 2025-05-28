import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScannerComponent } from '../shared/scanner/scanner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venta',
  imports: [RouterModule, ScannerComponent, CommonModule],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})
export class VentaComponent {
  
  handleScan(scannedCode: string): void {
    console.log('Código escaneado recibido:', scannedCode);
    // Aquí puedes procesar el código escaneado
    // Por ejemplo: buscar el producto, agregarlo al carrito, etc.
  }
}