import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioMonturaComponent } from './formulario-montura.component';

describe('FormularioMonturaComponent', () => {
  let component: FormularioMonturaComponent;
  let fixture: ComponentFixture<FormularioMonturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioMonturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioMonturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
