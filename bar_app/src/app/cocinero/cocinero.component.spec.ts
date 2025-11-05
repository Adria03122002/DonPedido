import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocineroComponent } from './cocinero.component';

describe('CocineroComponent', () => {
  let component: CocineroComponent;
  let fixture: ComponentFixture<CocineroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CocineroComponent]
    });
    fixture = TestBed.createComponent(CocineroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
