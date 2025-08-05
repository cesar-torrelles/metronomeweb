import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecapitatorComponent } from './decapitator.component';

describe('DecapitatorComponent', () => {
  let component: DecapitatorComponent;
  let fixture: ComponentFixture<DecapitatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecapitatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecapitatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
