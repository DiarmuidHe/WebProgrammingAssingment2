import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AdminService } from '../admin.service';
import {
  AdminAccountDetails,
  AdminAccountSummary,
  AdminEntityType,
  ModerationAction,
} from '../admin.models';
import { DeleteAccountConfirmationDialogComponent } from '../delete-account-confirmation-dialog/delete-account-confirmation-dialog.component';
import { SuspensionReasonDialogComponent } from '../suspension-reason-dialog/suspension-reason-dialog.component';

type SummaryMap = Record<AdminEntityType, AdminAccountSummary[]>;
type BoolMap = Record<AdminEntityType, boolean>;
type StringMap = Record<AdminEntityType, string>;
type DetailsCacheMap = Record<AdminEntityType, Record<string, AdminAccountDetails>>;
type DetailLoadingMap = Record<string, boolean>;
type DetailErrorMap = Record<string, string>;

@Component({
  selector: 'app-admin-moderation-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './admin-moderation-page.component.html',
  styleUrl: './admin-moderation-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModerationPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly activeTab = signal<AdminEntityType>('jobseekers');
  readonly searchTerm = signal('');
  readonly summaries = signal<SummaryMap>({
    jobseekers: [],
    employers: [],
  });
  readonly loadingByType = signal<BoolMap>({
    jobseekers: false,
    employers: false,
  });
  readonly errorByType = signal<StringMap>({
    jobseekers: '',
    employers: '',
  });
  readonly expandedAccountId = signal<string | null>(null);
  readonly detailsCache = signal<DetailsCacheMap>({
    jobseekers: {},
    employers: {},
  });
  readonly detailsLoadingById = signal<DetailLoadingMap>({});
  readonly detailsErrorById = signal<DetailErrorMap>({});
  readonly busyAccountId = signal<string | null>(null);
  readonly busyAction = signal<ModerationAction | null>(null);

  readonly filteredAccounts = computed(() => {
    const accounts = this.summaries()[this.activeTab()];
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return accounts;
    }

    return accounts.filter((account) =>
      [account.displayName, account.email, account.status].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  });

  readonly jobseekerCount = computed(() => this.summaries().jobseekers.length);
  readonly employerCount = computed(() => this.summaries().employers.length);
  readonly activeLoading = computed(() => this.loadingByType()[this.activeTab()]);
  readonly activeError = computed(() => this.errorByType()[this.activeTab()]);

  ngOnInit(): void {
    this.loadList('jobseekers');
    this.loadList('employers');
  }

  setActiveTab(tab: AdminEntityType): void {
    if (tab === this.activeTab()) {
      return;
    }

    this.activeTab.set(tab);
    this.searchTerm.set('');
    this.expandedAccountId.set(null);

    if (!this.summaries()[tab].length && !this.loadingByType()[tab]) {
      this.loadList(tab);
    }
  }

  toggleExpanded(account: AdminAccountSummary): void {
    const nextId = this.expandedAccountId() === account.id ? null : account.id;
    this.expandedAccountId.set(nextId);

    if (nextId) {
      this.loadDetails(account.entityType, account.id);
    }
  }

  onToggleSuspension(account: AdminAccountSummary | AdminAccountDetails): void {
    const action: ModerationAction = account.status === 'suspended' ? 'unsuspend' : 'suspend';
    if (action === 'suspend') {
      this.confirmSuspend(account);
      return;
    }

    this.busyAccountId.set(account.id);
    this.busyAction.set(action);

    this.adminService
      .unsuspendAccount(account.entityType, account.id)
      .pipe(finalize(() => this.clearBusyState()))
      .subscribe({
        next: () => {
          this.snackBar.open(`${account.displayName} has been reactivated.`, 'Close', {
            duration: 3000,
          });
          this.reloadEntity(account.entityType, account.id);
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message ?? 'Moderation action failed. Please try again.',
            'Close',
            { duration: 4000 }
          );
        },
      });
  }

  onDelete(account: AdminAccountSummary | AdminAccountDetails): void {
    const dialogRef = this.dialog.open(DeleteAccountConfirmationDialogComponent, {
      data: {
        accountName: account.displayName,
        entityLabel: account.entityType === 'jobseekers' ? 'jobseeker' : 'employer',
      },
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.busyAccountId.set(account.id);
      this.busyAction.set('delete');

      this.adminService
        .deleteAccount(account.entityType, account.id)
        .pipe(finalize(() => this.clearBusyState()))
        .subscribe({
          next: () => {
            this.snackBar.open(`${account.displayName} has been deleted.`, 'Close', {
              duration: 3000,
            });
            this.removeFromState(account.entityType, account.id);
          },
          error: (err) => {
            this.snackBar.open(
              err?.error?.message ?? 'Delete failed. Please try again.',
              'Close',
              { duration: 4000 }
            );
          },
        });
    });
  }

  getAccountDetails(account: AdminAccountSummary): AdminAccountDetails | null {
    return this.detailsCache()[account.entityType][account.id] ?? null;
  }

  isExpanded(accountId: string): boolean {
    return this.expandedAccountId() === accountId;
  }

  isDetailsLoading(accountId: string): boolean {
    return Boolean(this.detailsLoadingById()[accountId]);
  }

  getDetailsError(accountId: string): string {
    return this.detailsErrorById()[accountId] ?? '';
  }

  isBusy(accountId: string, action: 'toggle' | 'delete'): boolean {
    if (this.busyAccountId() !== accountId) {
      return false;
    }

    const busyAction = this.busyAction();
    return action === 'toggle'
      ? busyAction === 'suspend' || busyAction === 'unsuspend'
      : busyAction === 'delete';
  }

  private loadList(entityType: AdminEntityType): void {
    this.patchLoading(entityType, true);
    this.patchError(entityType, '');

    this.adminService
      .listAccounts(entityType)
      .pipe(finalize(() => this.patchLoading(entityType, false)))
      .subscribe({
        next: (accounts) => {
          this.summaries.update((current) => ({
            ...current,
            [entityType]: accounts,
          }));

          if (
            this.activeTab() === entityType &&
            this.expandedAccountId() &&
            !accounts.some((account) => account.id === this.expandedAccountId())
          ) {
            this.expandedAccountId.set(null);
          }
        },
        error: (err) => {
          this.patchError(
            entityType,
            err?.error?.message ?? 'Unable to load moderation accounts for this section.'
          );
        },
      });
  }

  private confirmSuspend(account: AdminAccountSummary | AdminAccountDetails): void {
    const dialogRef = this.dialog.open(SuspensionReasonDialogComponent, {
      data: {
        accountName: account.displayName,
        entityLabel: account.entityType === 'jobseekers' ? 'jobseeker' : 'employer',
      },
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (!reason) {
        return;
      }

      this.busyAccountId.set(account.id);
      this.busyAction.set('suspend');

      this.adminService
        .suspendAccount(account.entityType, account.id, reason)
        .pipe(finalize(() => this.clearBusyState()))
        .subscribe({
          next: () => {
            this.snackBar.open(`${account.displayName} has been suspended.`, 'Close', {
              duration: 3000,
            });
            this.reloadEntity(account.entityType, account.id);
          },
          error: (err) => {
            this.snackBar.open(
              err?.error?.message ?? 'Moderation action failed. Please try again.',
              'Close',
              { duration: 4000 }
            );
          },
        });
    });
  }

  private loadDetails(entityType: AdminEntityType, id: string, force = false): void {
    if (!force && this.detailsCache()[entityType][id]) {
      return;
    }

    if (this.detailsLoadingById()[id]) {
      return;
    }

    this.detailsLoadingById.update((current) => ({
      ...current,
      [id]: true,
    }));
    this.detailsErrorById.update((current) => ({
      ...current,
      [id]: '',
    }));

    this.adminService
      .getAccountDetails(entityType, id)
      .pipe(
        finalize(() =>
          this.detailsLoadingById.update((current) => ({
            ...current,
            [id]: false,
          }))
        )
      )
      .subscribe({
        next: (details) => {
          this.detailsCache.update((current) => ({
            ...current,
            [entityType]: {
              ...current[entityType],
              [id]: details,
            },
          }));
        },
        error: (err) => {
          this.detailsErrorById.update((current) => ({
            ...current,
            [id]: err?.error?.message ?? 'Unable to load account details.',
          }));
        },
      });
  }

  private reloadEntity(entityType: AdminEntityType, selectedId?: string): void {
    if (selectedId) {
      this.clearCachedDetails(entityType, selectedId);
      this.loadDetails(entityType, selectedId, true);
    }

    this.loadList(entityType);
  }

  private removeFromState(entityType: AdminEntityType, id: string): void {
    const nextAccounts = this.summaries()[entityType].filter((account) => account.id !== id);
    this.summaries.update((current) => ({
      ...current,
      [entityType]: nextAccounts,
    }));

    this.detailsCache.update((current) => {
      const nextTypeCache = { ...current[entityType] };
      delete nextTypeCache[id];

      return {
        ...current,
        [entityType]: nextTypeCache,
      };
    });

    this.detailsErrorById.update((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    this.detailsLoadingById.update((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    if (this.expandedAccountId() === id) {
      this.expandedAccountId.set(null);
    }
  }

  private patchLoading(entityType: AdminEntityType, loading: boolean): void {
    this.loadingByType.update((current) => ({
      ...current,
      [entityType]: loading,
    }));
  }

  private patchError(entityType: AdminEntityType, error: string): void {
    this.errorByType.update((current) => ({
      ...current,
      [entityType]: error,
    }));
  }

  private clearBusyState(): void {
    this.busyAccountId.set(null);
    this.busyAction.set(null);
  }

  private clearCachedDetails(entityType: AdminEntityType, id: string): void {
    this.detailsCache.update((current) => {
      const nextTypeCache = { ...current[entityType] };
      delete nextTypeCache[id];

      return {
        ...current,
        [entityType]: nextTypeCache,
      };
    });
  }
}
