// employer-detail-component.ts
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
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
@Component({
  selector: 'app-employer-detail-component',
  standalone: true,
  imports: [
    MatInput,
    MatSelect,
    DatePipe,
    MatError,
    MatProgressSpinner,
    MatCardModule,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatChipsModule,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatOption
  ],
  templateUrl: './employer-detail-component.html',
  styleUrl: './employer-detail-component.scss',
})
export class EmployerDetailComponent implements OnInit {
   private route = inject(ActivatedRoute);
  private employerService = inject(EmployerService);

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  employer: Employer | null = null;

  displayedColumns: string[] = [
    'title',
    'location',
    'jobType',
    'active',
    'postedAt'
  ];

  jobForm!: FormGroup;

  ngOnInit(): void {
    this.jobForm = this.fb.group({
      jobId: ['', Validators.required],
      title: ['', Validators.required],
      location: [''],
      jobType: ['full-time', Validators.required],
      description: [''],
      salaryMin: [null],
      salaryMax: [null],
      salaryCurrency: [''],
      categories: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployer(id);
    }
  }

  loadEmployer(id: string): void {
    this.employerService.getEmployerById(id).subscribe({
      next: (data) => { this.employer = data; this.cdr.markForCheck(); },
      error: (err) => { console.error('Error loading employer', err); this.cdr.markForCheck(); }
    });
  }

  onToggleJobActive(job: Job): void {
    if (!this.employer || !this.employer._id) return;

    const employerId = this.employer._id;
    const newStatus = !job.active;

    // local update so the UI reacts immediately
    const previousStatus = job.active;
    job.active = newStatus;

    this.employerService.toggleJobActive(employerId, job.jobId, newStatus).subscribe({
      next: (updatedJob) => {
        job.active = newStatus;

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error toggling job status', err);
        // 🔁 Revert UI on error
        job.active = previousStatus;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitJob(): void {
    if (!this.jobForm.valid || !this.employer || !this.employer._id) return;

    const employerId = this.employer._id;
    const v = this.jobForm.value;

    const newJob: Job = {
      jobId: v.jobId,
      title: v.title,
      description: v.description || '',
      location: v.location || '',
      jobType: v.jobType,
      active: true,
      postedAt: new Date().toISOString(),
      categories: v.categories
        ? v.categories.split(',').map((c: string) => c.trim()).filter((c: string) => !!c)
        : [],
      salary:
        v.salaryMin || v.salaryMax || v.salaryCurrency
          ? {
              min: v.salaryMin ? Number(v.salaryMin) : undefined,
              max: v.salaryMax ? Number(v.salaryMax) : undefined,
              currency: v.salaryCurrency || '',
              period: 'year',
            }
          : undefined,
    };

    this.employerService.addJobs(employerId, [newJob]).subscribe({
      next: () => {
        this.employer = {
          ...this.employer!,
          jobs: [...(this.employer!.jobs || []), newJob],
        };
        this.jobForm.reset({ jobType: 'full-time' });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to add job:', err);
        this.cdr.markForCheck();
      }
    });
  } 
}
