import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemasService {

 private readonly lightTheme = {
    '--background-color': '#f5f5f5',
    '--surface-color':    '#ffffff',
    '--card-bg-color':    '#f0f0f0',
    '--input-bg-color':   '#ffffff',
    '--border-color':     '#d1d1d1',
    '--text-color':       '#333333',
    '--text-secondary':   '#555555',
    '--primary-color':    '#1976d2',
    '--accent-color':     '#90caf9',
    '--error-color':      '#e53935',
  };

  private readonly darkTheme = {
    '--background-color': '#121212',
    '--surface-color':    '#1e1e1e',
    '--card-bg-color':    '#242424',
    '--input-bg-color':   '#2a2a2a',
    '--border-color':     '#333333',
    '--text-color':       '#e0e0e0',
    '--text-secondary':   '#aaaaaa',
    '--primary-color':    '#90caf9',
    '--accent-color':     '#1976d2',
    '--error-color':      '#ff6e6e',
  };
  
  aplicarBlanco(): void {
    this.applyTheme(this.lightTheme);
  }

  aplicarOscuro(): void {
    this.applyTheme(this.darkTheme);
  }

  private applyTheme(theme: Record<string, string>): void {
    const root = document.documentElement;
    Object.entries(theme).forEach(([variable, valor]) => {
      root.style.setProperty(variable, valor);
    });
  }
}
