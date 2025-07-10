import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css'
})
export class StatsCardComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() value: string | number | null = '';
  @Input() dateRange: string = ''; 
  //Inputs para cambiar tamaño desde fuera
  @Input() width: string = 'w-full';
  @Input() height: string = 'h-auto';

}
