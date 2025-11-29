import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployerService } from '../employers/employer.service';
import { Employer } from '../employers/employer.interface';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-employer-list',
    imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule

  ],
  standalone: true,
  templateUrl: './employer-form-component.html',
  styleUrls: ['./employer-form-component.scss']
})
export class EmployerFormComponent{
  private fb = inject(FormBuilder);
  private employerService = inject(EmployerService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
    description: [''],
    location: ['', Validators.required],
    logo: ['']
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employer: Employer = this.form.value;

    this.employerService.createEmployer(employer).subscribe({
      next: () => this.router.navigate(['/employers']),
      error: (err) => console.error('Error creating employer', err)
    });
  }
}
