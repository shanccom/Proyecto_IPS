import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-comprobante',
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule, CommonModule],
  templateUrl: './comprobante.component.html',
  styleUrl: './comprobante.component.css' 
})


export class ComprobanteComponent {

  tipoComprobante: string = '01';  
  serie: string = 'F001';
  correlativo: string = ''; 
  estadoSunat: string = 'pendiente'; 
  fechaEmision: Date = new Date(); 

  cliente = {
    tipo_doc: '',
    num_doc: '',
    rzn_social: ''
  };

  items = [
    {
      tipo_producto: 'accesorio',
      producto_accesorio: {
        codigo: '',
        descripcion: ''
      },
      precio_unitario: 0,
      cantidad: 1
    }
  ];

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
    // Accedemos a los parámetros de la ruta
    this.activatedRoute.params.subscribe(params => {
      console.log(params);  // Para depuración
    });
  }

  eliminarItem(index: number) {
    this.items.splice(index, 1);
  }

  agregarItem() {
    this.items.push({
      tipo_producto: 'accesorio',
      producto_accesorio: {
        codigo: '',
        descripcion: ''
      },
      precio_unitario: 0,
      cantidad: 1
    });
  }

  crearComprobante() {
    const comprobanteData = {
      cliente: this.cliente,
      tipo_comprobante: this.tipoComprobante,
      serie: this.serie,
      correlativo: this.correlativo,
      estado_sunat: this.estadoSunat,
      fecha_emision: this.fechaEmision.toISOString(),
      items: this.items
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
