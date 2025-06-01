import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioAccesorioComponent } from './formulario-accesorio.component';

describe('FormularioAccesorioComponent', () => {
  let component: FormularioAccesorioComponent;
  let fixture: ComponentFixture<FormularioAccesorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAccesorioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioAccesorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
