import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaproductComponent } from './altaproduct.component';

describe('AltaproductComponent', () => {
  let component: AltaproductComponent;
  let fixture: ComponentFixture<AltaproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
