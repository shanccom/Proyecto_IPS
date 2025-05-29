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
      this.requestCameraPermission();
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  private async requestCameraPermission(): Promise<void> {
    try {
      // Verificar el estado de permisos primero
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      console.log('Estado de permisos de cámara:', permission.state);
      
      // Solicitar permisos de cámara explícitamente
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Preferir cámara trasera
        } 
      });
      
      console.log('Permisos de cámara concedidos');
      
      // Detener el stream temporal
      stream.getTracks().forEach(track => track.stop());
      
      await this.listarCamaras();
      this.initializeScanner();
    } catch (error) {
      console.error('Error al solicitar permisos de cámara:', error);
      this.handlePermissionError(error);
    }
  }

  private handlePermissionError(error: any): void {
    if (error.name === 'NotAllowedError') {
      console.error('Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración del navegador.');
      alert('Para usar el escáner, necesitas permitir el acceso a la cámara. Ve a la configuración del navegador y permite el acceso a la cámara para este sitio.');
    } else if (error.name === 'NotFoundError') {
      console.error('No se encontró ninguna cámara disponible.');
      alert('No se detectó ninguna cámara en tu dispositivo.');
    } else if (error.name === 'NotReadableError') {
      console.error('La cámara está siendo usada por otra aplicación.');
      alert('La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que usen la cámara e intenta de nuevo.');
    } else {
      console.error('Error desconocido:', error);
      alert('Error al acceder a la cámara: ' + error.message);
    }
  }

  private initializeScanner(): void {
    const scannerElement = document.querySelector('#scanner');
    if (!scannerElement) {
      console.error('No se encontró el elemento #scanner');
      return;
    }

    const config: any = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerElement,
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment",
          deviceId: this.selectedDeviceId || undefined
        }
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "upc_reader"
        ]
      },
      locate: true,
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10
    };

    Quagga.init(config, (err: any) => {
      if (err) {
        console.error('Error inicializando Quagga:', err);
        return;
      }
      
      console.log('Quagga inicializado correctamente');
      this.isQuaggaInitialized = true;
      Quagga.start();
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

    const qualityThreshold = 100;
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
    if (code === this.lastScannedCode) {
      return;
    }

    this.scannedCodes.push(code);
     
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
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (this.videoDevices.length > 0 && !this.selectedDeviceId) {
        this.selectedDeviceId = this.videoDevices[0].deviceId;
      }
    } catch (error) {
      console.error('Error listando cámaras:', error);
    }
  }

  async cambiarCamara() {
    this.stopScanner();
    await this.requestCameraPermission();
  }

  // Método para reiniciar permisos manualmente
  public async resetPermissions(): Promise<void> {
    console.log('Reiniciando permisos de cámara...');
    this.stopScanner();
    
    // Limpiar cualquier stream anterior
    const video = document.querySelector('#scanner video') as HTMLVideoElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    
    await this.requestCameraPermission();
  }
}