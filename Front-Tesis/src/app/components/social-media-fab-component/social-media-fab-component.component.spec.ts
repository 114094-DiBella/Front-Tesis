import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaFabComponentComponent } from './social-media-fab-component.component';

describe('SocialMediaFabComponentComponent', () => {
  let component: SocialMediaFabComponentComponent;
  let fixture: ComponentFixture<SocialMediaFabComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediaFabComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaFabComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
