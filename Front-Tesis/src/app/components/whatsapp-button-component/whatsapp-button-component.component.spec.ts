import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappButtonComponentComponent } from './whatsapp-button-component.component';

describe('WhatsappButtonComponentComponent', () => {
  let component: WhatsappButtonComponentComponent;
  let fixture: ComponentFixture<WhatsappButtonComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappButtonComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappButtonComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
