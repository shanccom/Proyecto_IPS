import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {

  private title: string = 'hola'; 

  setTitle(newTitle: string): void {
    this.title = newTitle;
  }

  getTitle(): string {
    return this.title;
  }
}
