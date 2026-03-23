import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  AdminAccountDetails,
  AdminAccountSummary,
  AdminDetailField,
  AdminEntityType,
} from './admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUri}/admin`;

  listAccounts(entityType: AdminEntityType): Observable<AdminAccountSummary[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${entityType}`)
      .pipe(map((response) => this.extractArray(response).map((item) => this.toSummary(entityType, item))));
  }

  getAccountDetails(entityType: AdminEntityType, id: string): Observable<AdminAccountDetails> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${entityType}/${id}`)
      .pipe(map((response) => this.toDetails(entityType, response)));
  }

  suspendAccount(entityType: AdminEntityType, id: string, reason?: string): Observable<void> {
    const payload = reason?.trim() ? { reason: reason.trim() } : {};
    return this.http.patch<void>(`${this.apiUrl}/${entityType}/${id}/suspend`, payload);
  }

  unsuspendAccount(entityType: AdminEntityType, id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${entityType}/${id}/unsuspend`, {});
  }

  deleteAccount(entityType: AdminEntityType, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${entityType}/${id}`, {
      body: { confirm: 'DELETE' },
    });
  }

  private toSummary(entityType: AdminEntityType, input: unknown): AdminAccountSummary {
    const item = this.toRecord(input);
    const moderation = this.toRecord(item['moderation']);
    const id = this.toString(item['_id']) || this.toString(item['id']) || '';
    const status = this.isSuspended(item, moderation) ? 'suspended' : 'active';

    return {
      id,
      entityType,
      displayName:
        entityType === 'employers'
          ? this.toString(item['companyName']) || this.toString(item['name']) || 'Unnamed employer'
          : this.toString(item['name']) || this.toString(item['email']) || 'Unnamed jobseeker',
      email:
        entityType === 'employers'
          ? this.toString(item['contactEmail']) || this.toString(item['email'])
          : this.toString(item['email']),
      status,
      createdAt:
        this.toString(item['createdAt']) ||
        this.toString(item['created_at']) ||
        this.toString(item['createdOn']) ||
        null,
    };
  }

  private toDetails(entityType: AdminEntityType, input: unknown): AdminAccountDetails {
    const item = this.toRecord(input);
    const moderation = this.toRecord(item['moderation']);
    const summary = this.toSummary(entityType, item);
    const detailFields: AdminDetailField[] =
      entityType === 'employers'
        ? [
            { label: 'Company name', value: summary.displayName },
            { label: 'Contact email', value: summary.email || 'Not provided' },
            { label: 'Location', value: this.toString(item['location']) || 'Not provided' },
            { label: 'Description', value: this.toString(item['description']) || 'Not provided' },
            { label: 'Live jobs', value: this.toCount(item['jobs']) || this.toNumericString(item['jobsCount']) },
            { label: 'Account ID', value: summary.id },
          ]
        : [
            { label: 'Name', value: summary.displayName },
            { label: 'Email', value: summary.email || 'Not provided' },
            { label: 'Skills', value: this.toSkills(item['skills']) },
            {
              label: 'Applications',
              value: this.toCount(item['applications']) || this.toNumericString(item['applicationCount']),
            },
            { label: 'Account ID', value: summary.id },
          ];

    return {
      ...summary,
      detailFields: [
        ...detailFields,
        {
          label: 'Created',
          value: summary.createdAt || 'Unavailable',
        },
      ],
      suspensionReason:
        this.toString(moderation['suspensionReason']) ||
        this.toString(item['suspensionReason']) ||
        this.toString(item['suspendedReason']) ||
        this.toString(item['reason']) ||
        null,
      suspendedAt: this.toString(moderation['suspendedAt']) || this.toString(item['suspendedAt']) || null,
    };
  }

  private extractArray(response: unknown): Array<Record<string, unknown>> {
    if (Array.isArray(response)) {
      return response.map((item) => this.toRecord(item));
    }

    const record = this.toRecord(response);
    const value = Object.values(record).find((entry) => Array.isArray(entry));
    return Array.isArray(value) ? value.map((item) => this.toRecord(item)) : [];
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  }

  private toString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private isSuspended(item: Record<string, unknown>, moderation?: Record<string, unknown>): boolean {
    return Boolean(
      moderation?.['isSuspended'] ??
        item['isSuspended'] ??
        item['suspended'] ??
        item['blocked'] ??
        (typeof item['status'] === 'string' && item['status'].toLowerCase() === 'suspended')
    );
  }

  private toCount(value: unknown): string {
    return Array.isArray(value) ? String(value.length) : '';
  }

  private toNumericString(value: unknown): string {
    return typeof value === 'number' ? String(value) : '0';
  }

  private toSkills(value: unknown): string {
    return Array.isArray(value)
      ? value.filter((item) => typeof item === 'string').join(', ') || 'None listed'
      : 'None listed';
  }
}
