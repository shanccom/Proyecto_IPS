import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioLunaComponent } from './formulario-luna.component';

describe('FormularioLunaComponent', () => {
  let component: FormularioLunaComponent;
  let fixture: ComponentFixture<FormularioLunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioLunaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioLunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
