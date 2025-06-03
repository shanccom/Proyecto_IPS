import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioFiltrosComponent } from './inventario-filtros.component';

describe('InventarioFiltrosComponent', () => {
  let component: InventarioFiltrosComponent;
  let fixture: ComponentFixture<InventarioFiltrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioFiltrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioFiltrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
