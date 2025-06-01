import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

@Component({
  selector: 'app-scanner',
  imports: [CommonModule, FormsModule],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  videoDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  @Output() scanned = new EventEmitter<string>();
  
  private codeReader: BrowserMultiFormatReader | null = null;
  private currentStream: MediaStream | null = null;
  private lastScannedCode = '';
  private scanTimeout: any;
  
  // Estado del scanner (públicas para el template)
  public isScanning = false;
  public isInitialized = false;
  public hasPermission = false;
  public errorMessage = '';
  public isLoading = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScanner();
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  private async initializeScanner(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Inicializar ZXing
      this.codeReader = new BrowserMultiFormatReader();
      
      // Solicitar permisos
      await this.requestCameraPermission();
      
      // Listar cámaras disponibles
      await this.listCameras();
      
      // Iniciar escáner
      await this.startScanning();
      
      this.isInitialized = true;
      this.isLoading = false;
      
    } catch (error) {
      console.error('Error inicializando scanner:', error);
      this.handleError(error);
      this.isLoading = false;
    }
  }

  private async requestCameraPermission(): Promise<void> {
    try {
      // Verificar estado de permisos
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      console.log('Estado de permisos de cámara:', permission.state);
      
      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Preferir cámara trasera
        } 
      });
      
      console.log('Permisos de cámara concedidos');
      this.hasPermission = true;
      
      // Detener stream temporal
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      this.hasPermission = false;
      throw error;
    }
  }

  private async listCameras(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (this.videoDevices.length > 0 && !this.selectedDeviceId) {
        // Buscar cámara trasera primero
        const backCamera = this.videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        this.selectedDeviceId = backCamera ? backCamera.deviceId : this.videoDevices[0].deviceId;
      }
      
      console.log('Cámaras disponibles:', this.videoDevices.length);
      
    } catch (error) {
      console.error('Error listando cámaras:', error);
      throw error;
    }
  }

  private async startScanning(): Promise<void> {
    if (!this.codeReader || !this.hasPermission || this.isScanning) {
      return;
    }

    try {
      this.isScanning = true;
      this.errorMessage = '';
      
      // Detener stream anterior si existe
      this.stopCurrentStream();
      
      const videoElement = this.videoElement?.nativeElement;
      if (!videoElement) {
        throw new Error('Elemento de video no encontrado');
      }

      // Configurar constraints para la cámara
      const constraints = {
        video: {
          deviceId: this.selectedDeviceId ? { exact: this.selectedDeviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: this.selectedDeviceId ? undefined : 'environment'
        }
      };

      // Obtener stream de video
      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.currentStream;
      
      // Reproducir video
      await videoElement.play();
      
      // Iniciar decodificación continua
      this.codeReader.decodeFromVideoDevice(
        this.selectedDeviceId,
        videoElement,
        (result, error) => {
          if (result) {
            this.handleBarcodeDetected(result.getText());
          } else if (error && !(error instanceof NotFoundException)) {
            console.error('Error de decodificación:', error);
          }
        }
      );
      
      console.log('Scanner iniciado correctamente');
      
    } catch (error) {
      console.error('Error iniciando scanner:', error);
      this.isScanning = false;
      this.handleError(error);
    }
  }

  private handleBarcodeDetected(code: string): void {
    if (!code || code === this.lastScannedCode) {
      return;
    }

    // Validar código de barras
    if (!this.isValidBarcode(code)) {
      return;
    }

    console.log('Código detectado:', code);
    this.lastScannedCode = code;
    
    // Pausar temporalmente el escáner
    this.pauseScanning();
    
    // Emitir el código escaneado
    this.scanned.emit(code);
    
    // Reanudar después de un tiempo
    this.scanTimeout = setTimeout(() => {
      this.resumeScanning();
    }, 500);
  }

  private isValidBarcode(code: string): boolean {
    // Validaciones básicas
    if (!code || code.length < 4 || code.length > 50) {
      return false;
    }

    // Evitar códigos duplicados muy rápidos
    if (this.scanTimeout) {
      return false;
    }

    return true;
  }

  public async cambiarCamara(): Promise<void> {
    console.log('Cambiando a cámara:', this.selectedDeviceId);
    
    try {
      this.isLoading = true;
      await this.stopScanner();
      await this.startScanning();
      this.isLoading = false;
    } catch (error) {
      console.error('Error cambiando cámara:', error);
      this.handleError(error);
      this.isLoading = false;
    }
  }

  private pauseScanning(): void {
    if (this.codeReader) {
      this.codeReader.reset();
    }
  }

  private resumeScanning(): void {
    if (this.isScanning && this.codeReader) {
      const videoElement = this.videoElement?.nativeElement;
      if (videoElement) {
        this.codeReader.decodeFromVideoDevice(
          this.selectedDeviceId,
          videoElement,
          (result, error) => {
            if (result) {
              this.handleBarcodeDetected(result.getText());
            } else if (error && !(error instanceof NotFoundException)) {
              console.error('Error de decodificación:', error);
            }
          }
        );
      }
    }
  }

  private stopCurrentStream(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  private stopScanner(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    if (this.codeReader) {
      this.codeReader.reset();
    }

    this.stopCurrentStream();
    this.isScanning = false;
    this.lastScannedCode = '';
    
    console.log('Scanner detenido');
  }

  public async resetPermissions(): Promise<void> {
    console.log('Reiniciando permisos de cámara...');
    
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      await this.stopScanner();
      
      // Limpiar estado
      this.hasPermission = false;
      this.isInitialized = false;
      this.videoDevices = [];
      this.selectedDeviceId = '';
      
      // Reinicializar
      await this.initializeScanner();
      
    } catch (error) {
      console.error('Error reiniciando permisos:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleError(error: any): void {
    this.isScanning = false;
    this.isLoading = false;
    
    if (error.name === 'NotAllowedError') {
      this.errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara.';
    } else if (error.name === 'NotFoundError') {
      this.errorMessage = 'No se encontró ninguna cámara disponible.';
    } else if (error.name === 'NotReadableError') {
      this.errorMessage = 'La cámara está siendo usada por otra aplicación.';
    } else if (error.name === 'OverconstrainedError') {
      this.errorMessage = 'La cámara seleccionada no es compatible.';
    } else {
      this.errorMessage = `Error: ${error.message || 'Error desconocido'}`;
    }
    
    console.error('Error del scanner:', this.errorMessage);
  }

  // Métodos públicos para control externo
  public startScan(): void {
    this.startScanning();
  }

  public stopScan(): void {
    this.stopScanner();
  }

  public get isActive(): boolean {
    return this.isScanning;
  }
}