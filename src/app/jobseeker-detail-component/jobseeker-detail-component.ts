import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgStyle, DatePipe } from '@angular/common';

import { EmployerService } from '../employers/employer.service';          
import { JobSeekerService } from '../jobseekers/jobseeker.service';      
import { AuthService } from '../auth/auth.service';              

import { Employer } from '../employers/employer.interface';          
import { Job } from '../jobs/job.interface';
import { Application } from '../aplications/application.interface';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-jobseeker-detail-component',
  standalone: true,
  imports: [
    NgStyle,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './jobseeker-detail-component.html',
  styleUrl: './jobseeker-detail-component.scss'
})
export class JobseekerDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employerService = inject(EmployerService);
  private jobSeekerService = inject(JobSeekerService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  employer: Employer | null = null;
  job: Job | null = null;
  loading = false;

  ngOnInit(): void {
    const employerId = this.route.snapshot.paramMap.get('employerId');
    const jobId = this.route.snapshot.paramMap.get('jobId');

    if (!employerId || !jobId) {
      this.router.navigate(['/jobs']);
      return;
    }

    this.loading = true;
    this.employerService.getEmployerById(employerId).subscribe({
      next: (employer) => {
        this.employer = employer;
        this.job = (employer.jobs || []).find(j => j.jobId === jobId) || null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading job detail', err);
        this.loading = false;
        this.router.navigate(['/jobs']);
        this.cdr.markForCheck();
      }
    });
  }

  getSalaryRange(): string {
    if (!this.job || !this.job.salary) {
      return '';
    }
    return `${this.job.salary.currency} ${
      this.job.salary.min?.toLocaleString() ?? 'N/A'
    } - ${
      this.job.salary.max?.toLocaleString() ?? 'N/A'
    }`;
  }

  GoToJobList(): void {
    this.router.navigate(['/jobs']);
  }

onApply(): void {
  if (!this.employer || !this.employer._id || !this.job) {
    alert('Job or employer not loaded.');
    return;
  }

  const jobSeekerId = this.authService.getCurrentJobSeekerId();

  if (!jobSeekerId) {
    alert('Please log in as a jobseeker before applying.');
    return;
  }

  const application: Application = {
    employerId: this.employer._id,
    jobId: this.job.jobId,
    appliedAt: new Date().toISOString(),
    status: 'submitted',
    coverLetter: null
  };

  console.log("DEBUG: application object", application);
  console.log("DEBUG: jobSeekerId", jobSeekerId);

  this.jobSeekerService.addApplication(jobSeekerId, application).subscribe({
    next: (res) => {
      console.log('Application added:', res);
      this.router.navigate(['/jobs']);
      alert('Application submitted successfully!');

    },
    error: (err) => {
      console.error('Error submitting application', err);
      this.router.navigate(['/jobs']);
      alert('Failed to submit application.');
    }
    
  });

}


}
