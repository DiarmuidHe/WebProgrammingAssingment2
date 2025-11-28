import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployerList } from './employer-list';

describe('EmployerList', () => {
  let component: EmployerList;
  let fixture: ComponentFixture<EmployerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployerList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployerList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
