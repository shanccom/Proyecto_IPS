// Cambios realizados:
// - Se agregó verificación con isPlatformBrowser para evitar usar 'document' fuera del navegador.
// - Se aplica clase theme-{modo} y theme-colors-{paleta} en document.documentElement

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type TemaBase = 'light' | 'dark';
type PaletaColor = 'blue' | 'rose' | 'emerald' | 'amber' | 'crimson';

@Injectable({
  providedIn: 'root',
})
export class TemasService {
  private temaActual: TemaBase = 'light';
  private paletaActual: PaletaColor = 'blue';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.aplicarTema(this.temaActual, this.paletaActual);
    }
  }

  cambiarTema(tema: TemaBase): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.classList.remove(`theme-${this.temaActual}`);
    root.classList.add(`theme-${tema}`);
    this.temaActual = tema;
  }

  cambiarPaleta(paleta: PaletaColor): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.classList.remove(`theme-colors-${this.paletaActual}`);
    root.classList.add(`theme-colors-${paleta}`);
    this.paletaActual = paleta;
  }

  aplicarTema(tema: TemaBase, paleta: PaletaColor): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;

    root.classList.remove(`theme-${this.temaActual}`);
    root.classList.remove(`theme-colors-${this.paletaActual}`);
    root.classList.add(`theme-${tema}`);
    root.classList.add(`theme-colors-${paleta}`);

    this.temaActual = tema;
    this.paletaActual = paleta;
  }

  obtenerTema(): { tema: TemaBase; paleta: PaletaColor } {
    return {
      tema: this.temaActual,
      paleta: this.paletaActual,
    };
  }
  get isDarkMode(): boolean {
    return this.temaActual === 'dark';
  }
}
