import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SuspensionReasonDialogData } from '../admin.models';

@Component({
  selector: 'app-suspension-reason-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './suspension-reason-dialog.component.html',
  styleUrl: './suspension-reason-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuspensionReasonDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SuspensionReasonDialogComponent, string | null>);
  readonly data = inject<SuspensionReasonDialogData>(MAT_DIALOG_DATA);
  readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(300)],
  });

  confirmSuspend(): void {
    const value = this.reason.value.trim();
    if (!value) {
      this.reason.setErrors({ required: true });
      this.reason.markAsTouched();
      return;
    }

    if (value.length < 3) {
      this.reason.setErrors({ minlength: true });
      this.reason.markAsTouched();
      return;
    }

    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
