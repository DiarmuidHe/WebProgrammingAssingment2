import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeleteConfirmationData } from '../admin.models';

@Component({
  selector: 'app-delete-account-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './delete-account-confirmation-dialog.component.html',
  styleUrl: './delete-account-confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountConfirmationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteAccountConfirmationDialogComponent, boolean>);
  readonly data = inject<DeleteConfirmationData>(MAT_DIALOG_DATA);
  readonly confirmation = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  confirmDelete(): void {
    if (this.confirmation.value.trim() !== 'DELETE') {
      this.confirmation.setErrors({ mismatch: true });
      this.confirmation.markAsTouched();
      return;
    }

    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
