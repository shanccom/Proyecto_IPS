import { Component, OnInit } from '@angular/core';
import { VentasService } from '../services/ventas.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-ventas',
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-ventas.component.html',
  styleUrl: './lista-ventas.component.css'
})
export class ListaVentasComponent implements OnInit{
  boletas: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private boletaService: VentasService, private router: Router) {}

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
