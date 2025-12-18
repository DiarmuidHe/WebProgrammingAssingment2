import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // adjust path if needed

// Re-declare role type here
type UserRole = 'jobseeker' | 'employer';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-register-component',
  imports: [   
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatSnackBarModule,],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isSubmitting = signal(false);

  form: FormGroup = this.fb.group(
    {
      role: ['jobseeker' as UserRole, Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        '',
        [Validators.required, Validators.email],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(6)],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: [this.passwordsMatchValidator],
    }
  );

  // Custom validator for password match
  private passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  get roleCtrl() {
    return this.form.get('role');
  }

  get nameCtrl() {
    return this.form.get('name');
  }

  get emailCtrl() {
    return this.form.get('email');
  }

  get passwordCtrl() {
    return this.form.get('password');
  }

  get confirmPasswordCtrl() {
    return this.form.get('confirmPassword');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { role, name, email, password } = this.form.value as {
      role: UserRole;
      name: string;
      email: string;
      password: string;
    };

    const register$ =
      role === 'jobseeker'
        ? this.auth.registerJobseeker(name, email, password)
        : this.auth.registerEmployer(name, email, password);

    register$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackBar.open('Registration successful! You are now logged in.', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/']); // adjust to wherever you want to land after register
      },
      error: (err) => {
        console.error('Registration error', err);
        this.isSubmitting.set(false);
        this.snackBar.open(
          err?.error?.message || 'Registration failed. Please try again.',
          'Close',
          { duration: 4000 }
        );
      },
    });
  }
}
