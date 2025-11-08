import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamareroComponent } from './camarero.component';

describe('CamareroComponent', () => {
  let component: CamareroComponent;
  let fixture: ComponentFixture<CamareroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CamareroComponent]
    });
    fixture = TestBed.createComponent(CamareroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
