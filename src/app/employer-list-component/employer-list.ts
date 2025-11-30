import { Component, OnInit, inject } from '@angular/core';
import { EmployerService } from '../employers/employer.service';
import { Employer } from '../employers/employer.interface';

import { MatCardHeader } from '@angular/material/card';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {ChangeDetectorRef} from '@angular/core';
@Component({
  selector: 'app-employer-list',
    imports: [
      MatCardHeader,
      MatCardModule,
      MatTableModule,
      MatButtonModule,
      RouterLink
  ],
  standalone: true,
  templateUrl: './employer-list.html',
  styleUrls: ['./employer-list.scss']
})
export class EmployerList {

  private employerService = inject(EmployerService);
  constructor(private cdr: ChangeDetectorRef) {}
  displayedColumns: string[] = [
    'companyName',
    'contactEmail',
    'location',
    'jobs',
    'actions'
  ];

  employers: Employer[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadEmployers();
  }

  loadEmployers(): void {
    this.loading = true;
    this.employerService.getEmployers().subscribe({
      next: (data) => {
        this.employers = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading employers', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteEmployer(id?: string): void {
    if (!id) {
      return;
    }

    if (!confirm('Are you sure you want to delete this employer?')) {
      return;
    }

    this.employerService.deleteEmployer(id).subscribe({
      next: () => this.loadEmployers(),
      error: (err) => console.error('Error deleting employer', err)
    });
  }

  getJobsCount(employer: Employer): number {
    return employer.jobs ? employer.jobs.length : 0;
  }
}
