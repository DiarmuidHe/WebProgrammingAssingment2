import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployerService } from '../employers/employer.service';
import { Employer } from '../employers/employer.interface';
import { Job } from '../jobs/job.interface';
import { NgStyle, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDivider } from '@angular/material/divider';
@Component({
  selector: 'app-jobseeker-detail-component',
  imports: [   
    NgStyle,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIcon,
    MatProgressSpinner,
    MatDivider
  ],
  templateUrl: './jobseeker-detail-component.html',
  styleUrl: './jobseeker-detail-component.scss',
})
export class JobseekerDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employerService = inject(EmployerService);
  constructor(

    private cdr: ChangeDetectorRef
  ) {}
  employer: Employer | null = null;
  job: Job | null = null;

  ngOnInit(): void {
    const employerId = this.route.snapshot.paramMap.get('employerId');
    const jobId = this.route.snapshot.paramMap.get('jobId');

    if (!employerId || !jobId) {
      this.router.navigate(['/jobseekers']);
      return;
    }

    this.employerService.getEmployerById(employerId).subscribe({
      next: (employer) => {
        this.employer = employer;
        const job = (employer.jobs || []).find(j => j.jobId === jobId) || null;
        this.job = job;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading job detail', err);
        this.router.navigate(['/jobseekers']);
        this.cdr.markForCheck();
      }
    });
    }

    getSalaryRange(): string {
      if (!this.job || !this.job.salary) {
        return '';
      }
      return `${this.job.salary?.currency} ${ this.job.salary?.min?.toLocaleString() ?? 'N/A' } - ${this.job.salary?.max?.toLocaleString() ?? 'N/A' }`;
    }
    GoToJobList(): void {
      this.router.navigate(['/jobseekers']);
    }
    onApply(): void {
      // Placeholder: this could navigate to a jobseeker form or application flow
      alert('Apply feature not implemented yet. Connect this to JobSeekerService.');
    }
}
