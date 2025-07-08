import { TestBed } from '@angular/core/testing';

import { GenerarComprobanteSunatService } from './generar-comprobante-sunat.service';

describe('GenerarComprobanteSunatService', () => {
  let service: GenerarComprobanteSunatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerarComprobanteSunatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
