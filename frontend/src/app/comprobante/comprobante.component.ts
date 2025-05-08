import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comprobante',
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule],
  templateUrl: './comprobante.component.html',
  styleUrl: './comprobante.component.css' 
})
export class ComprobanteComponent {

  tipoComprobante: string = '01';  
  serie: string = 'F001';
  correlativo: string = ''; 
  estadoSunat: string = 'pendiente'; 
  fechaEmision: Date = new Date(); 

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
    // Accedemos a los parámetros de la ruta
    this.activatedRoute.params.subscribe(params => {
      console.log(params);  // Para depuración
    });
  }

  crearComprobante() {
    const comprobanteData = {
      venta: {
        cliente: {
          tipo_doc: "6",  
          num_doc: "12345678",  
          rzn_social: "Nombre del Cliente" 
        }
      },
      tipo_comprobante: this.tipoComprobante,  
      serie: this.serie,
      correlativo: this.correlativo,
      estado_sunat: this.estadoSunat,
      fecha_emision: this.fechaEmision.toISOString(), 
      detalles: [
        {
          tipo_producto: "accesorio",  
          producto_accesorio: {
            codigo: "ABC123",  
            descripcion: "Descripción del accesorio"
          },
          precio_unitario: 100.0,  
          cantidad: 1  
        }
        
      ]
    };
    
    console.log('Datos que se enviarán al backend:', JSON.stringify(comprobanteData, null, 2));
    this.http.post('http://localhost:8000/apiCom/comprobantes/', comprobanteData)
      .subscribe({
        next: (res) => {
          console.log('Comprobante creado', res);
        },
        error: (err) => {
          console.error('Error al crear el comprobante:', err);
        }
      });
  }

}
