import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearIngredienteComponent } from './crear-ingrediente.component';

describe('CrearIngredienteComponent', () => {
  let component: CrearIngredienteComponent;
  let fixture: ComponentFixture<CrearIngredienteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrearIngredienteComponent]
    });
    fixture = TestBed.createComponent(CrearIngredienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
