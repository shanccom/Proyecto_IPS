import { Component, OnInit } from '@angular/core';
import { VentasService } from '../services/ventas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-ventas',
  imports: [CommonModule],
  templateUrl: './lista-ventas.component.html',
  styleUrl: './lista-ventas.component.css'
})
export class ListaVentasComponent implements OnInit{
  boletas: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private boletaService: VentasService) {}

  ngOnInit(): void {
    this.boletaService.obtenerBoletas().subscribe({
      next: (data) => {
        this.boletas = data.boletas;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar boletas';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
