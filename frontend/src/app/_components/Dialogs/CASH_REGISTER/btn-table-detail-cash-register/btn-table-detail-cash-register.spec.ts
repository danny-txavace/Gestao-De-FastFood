import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnTableDetailCashRegister } from './btn-table-detail-cash-register';

describe('BtnTableDetailCashRegister', () => {
  let component: BtnTableDetailCashRegister;
  let fixture: ComponentFixture<BtnTableDetailCashRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnTableDetailCashRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnTableDetailCashRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
