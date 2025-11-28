import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobseekerForm } from './jobseeker-form';

describe('JobseekerForm', () => {
  let component: JobseekerForm;
  let fixture: ComponentFixture<JobseekerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobseekerForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobseekerForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
