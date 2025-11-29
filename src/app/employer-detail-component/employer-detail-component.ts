import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployerService } from '../employers/employer.service';
import { Employer } from '../employers/employer.interface';
import { Job } from '../jobs/job.interface';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-employer-detail-component',
  standalone: true,
  imports: [
    DatePipe,   
    MatProgressSpinner,
    MatCardModule,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatChipsModule,
    MatIcon
  ],
  templateUrl: './employer-detail-component.html',
  styleUrl: './employer-detail-component.scss',
})
export class EmployerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employerService = inject(EmployerService);
  constructor(private cdr: ChangeDetectorRef) {}
  employer: Employer | null = null;

  displayedColumns: string[] = [
    'title',
    'location',
    'jobType',
    'active',
    'postedAt'
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployer(id);
    }
  }

  loadEmployer(id: string): void {
    this.employerService.getEmployerById(id).subscribe({
      next: (data) => {this.employer = data; this.cdr.markForCheck(); }
      ,
      error: (err) => {console.error('Error loading employer', err); this.cdr.markForCheck();   } 
    });
  }

  onToggleJobActive(job: Job): void {
    if (!this.employer || !this.employer._id) {
      return;
    }

    const employerId = this.employer._id;
    const newStatus = !job.active;

    this.employerService.toggleJobActive(employerId, job.jobId, newStatus).subscribe({
      next: (updatedJob) => {
        if (!this.employer) {
          return;
        }
        const jobs = this.employer.jobs || [];
        const index = jobs.findIndex(j => j.jobId === job.jobId);
        if (index >= 0) {
          jobs[index] = { ...jobs[index], active: updatedJob.active };
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error toggling job status', err);
        this.cdr.markForCheck();
      }
    });
  }
}
