import { TestBed } from '@angular/core/testing';

import { ProductoIngredienteService } from './producto-ingrediente.service';

describe('ProductoIngredienteService', () => {
  let service: ProductoIngredienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoIngredienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
