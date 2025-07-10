import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosVendidosComponent } from './productos-vendidos.component';

describe('ProductosVendidosComponent', () => {
  let component: ProductosVendidosComponent;
  let fixture: ComponentFixture<ProductosVendidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosVendidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosVendidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
