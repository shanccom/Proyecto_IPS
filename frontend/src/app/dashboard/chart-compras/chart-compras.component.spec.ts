import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComprasComponent } from './chart-compras.component';

describe('ChartComprasComponent', () => {
  let component: ChartComprasComponent;
  let fixture: ComponentFixture<ChartComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
