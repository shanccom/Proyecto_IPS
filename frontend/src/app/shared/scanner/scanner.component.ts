import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import Quagga from '@ericblade/quagga2';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-scanner',
  imports: [CommonModule, FormsModule],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})

export class ScannerComponent implements OnInit, OnDestroy {
  videoDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  @Output() scanned = new EventEmitter<string>();
  private isQuaggaInitialized = false;
  private lastScannedCode = '';
  private scannedCodes: string[] = [];
  private scanTimeout: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScanner(); 
      this.listarCamaras(); 
    }
  }

    ngOnDestroy(): void {
      this.stopScanner();
    }

    private initializeScanner(): void {
      const scannerElement = document.querySelector('#scanner');
      if (!scannerElement) {
        console.error('No se encontró el elemento #scanner');
        return;
      }

      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: scannerElement,
          constraints: {
            width: 640,
            height: 480,
            deviceId: this.selectedDeviceId ? { exact: this.selectedDeviceId } : undefined
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10, 
        decoder: {
          readers: [
            'code_128_reader',
            'ean_reader',
            'ean_8_reader',
            'code_39_reader'
          ],
          debug: {
            drawBoundingBox: false,
            showFrequency: false,
            drawScanline: false,
            showPattern: false
          }
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Error al iniciar Quagga:', err);
          return;
        }

        const el = document.getElementById('scanner');
        if (el) {
          el.style.backgroundImage = 'none';
        }
        
        this.isQuaggaInitialized = true;
        Quagga.start();
        console.log('Scanner iniciado correctamente');
      });

      Quagga.onDetected((result) => {
        const code = result.codeResult?.code;
        if (code && this.isValidBarcode(code, result)) {
          this.handleCodeDetection(code);
        }
      });
    }

    private isValidBarcode(code: string, result: any): boolean {
      if (code.length < 4 || code.length > 20) {
        return false;
      }

      const qualityThreshold = 100; // Ajustar
      if (result.codeResult.decodedCodes) {
        const avgQuality = result.codeResult.decodedCodes.reduce((sum: number, decoded: any) => {
          return sum + (decoded.error || 0);
        }, 0) / result.codeResult.decodedCodes.length;
        
        if (avgQuality > qualityThreshold) {
          return false;
        }
      }

      if (result.codeResult.format.includes('ean') || result.codeResult.format.includes('upc')) {
        if (!/^\d+$/.test(code)) {
          return false;
        }
      }

      return true;
    }

    private handleCodeDetection(code: string): void {
      // Evitar duplicados inmediatos
      if (code === this.lastScannedCode) {
        return;
      }

      this.scannedCodes.push(code);
      
      // Mantener solo los últimos 3 códigos
      if (this.scannedCodes.length > 3) {
        this.scannedCodes.shift();
      }

      const codeCount = this.scannedCodes.filter(c => c === code).length;
      
      if (codeCount >= 2) {
        this.confirmBarcode(code);
      }
    }

    private confirmBarcode(code: string): void {
      console.log('Código confirmado:', code);
      this.lastScannedCode = code;
      this.scannedCodes = [];
      
      this.pauseScanning();
      this.scanned.emit(code);
      

      this.scanTimeout = setTimeout(() => {
        this.startScanning();
      }, 1000);
    }

    private stopScanner(): void {
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      
      if (this.isQuaggaInitialized) {
        Quagga.stop();
        this.isQuaggaInitialized = false;
        console.log('Scanner detenido');
      }
    }

    public startScanning(): void {
      if (this.isQuaggaInitialized) {
        Quagga.start();
      }
    }

    public pauseScanning(): void {
      if (this.isQuaggaInitialized) {
        Quagga.pause();
      }
    }

    async listarCamaras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (this.videoDevices.length > 0) {
        this.selectedDeviceId = this.videoDevices[0].deviceId;
      }
    }
    cambiarCamara() {
      this.stopScanner(); 
      this.initializeScanner(); 
  }
}