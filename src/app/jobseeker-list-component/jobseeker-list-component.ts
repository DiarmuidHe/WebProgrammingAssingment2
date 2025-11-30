import { Component, OnInit, inject } from '@angular/core';
import { EmployerService } from '../employers/employer.service';
import { Employer } from '../employers/employer.interface';
import { JobSeekerService } from '../jobseekers/jobseeker.service';
import { Job } from '../jobs/job.interface';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../auth/auth.service';

interface JobWithEmployer extends Job {
  employerId: string;
  companyName: string;
}

@Component({
  selector: 'app-jobseeker-list-component',
  imports: [    
    DatePipe,
    FormsModule, 
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink],
  templateUrl: './jobseeker-list-component.html',
  styleUrl: './jobseeker-list-component.scss',
})
export class JobseekerListComponent implements OnInit {
  private employerService = inject(EmployerService);
  private jobseekerService = inject(JobSeekerService);
  private authService = inject(AuthService);

  displayedColumns: string[] = [
    'title',
    'company',
    'location',
    'jobType',
    'salary',
    'postedAt',
    'actions'
  ];

  allJobs: JobWithEmployer[] = [];
  jobs: JobWithEmployer[] = [];

  searchTerm = '';
  selectedLocation = '';
  selectedJobType = '';
  selectedCategory = '';

  locations: string[] = [];
  jobTypes: string[] = [];
  categories: string[] = [];
  
  private appliedJobIds = new Set<string>();

  ngOnInit(): void {
    console.log('[JobseekerListComponent] ngOnInit');
    this.loadJobs();
  }

  private loadJobs(): void {
    const currentId = this.authService.getCurrentJobSeekerId();
    console.log('[JobseekerListComponent] current jobseeker ID:', currentId);

    if (!currentId) {
      console.log('[JobseekerListComponent] No current jobseeker, loading all jobs with no filter');
      this.loadJobsWithoutFilter();
      return;
    }

    // Load applications for logged-in jobseeker
    console.log('[JobseekerListComponent] Fetching applications for jobseeker', currentId);
    this.jobseekerService.getApplications(currentId).subscribe({
      next: (apps) => {
        console.log('[JobseekerListComponent] Applications loaded:', apps);
        this.appliedJobIds = new Set(
          (apps || []).map(a => a.jobId)
        );
        console.log('[JobseekerListComponent] appliedJobIds set:', Array.from(this.appliedJobIds));
        // Now load jobs and filter using appliedJobIds
        this.loadJobsWithoutFilter();
      },
      error: (err) => {
        console.error('[JobseekerListComponent] Error loading applications', err);
        // Fallback: if it can’t load applications, show all jobs
        this.loadJobsWithoutFilter();
      }
    });
  }

  /** Loads jobs from employers and filters out those already applied for */
  private loadJobsWithoutFilter(): void {
    console.log('[JobseekerListComponent] Loading jobs from employers...');
    this.employerService.getEmployers().subscribe({
      next: (employers: Employer[]) => {
        console.log('[JobseekerListComponent] Employers loaded:', employers);
        const jobs: JobWithEmployer[] = [];

        employers.forEach(employer => {
          (employer.jobs || []).forEach(job => {
            const alreadyApplied = this.appliedJobIds.has(job.jobId);

            console.log(
              `[JobseekerListComponent] Checking job ${job.jobId} (${job.title}) from employer ${employer.companyName} - active=${job.active}, alreadyApplied=${alreadyApplied}`
            );

            // Only show active jobs the user has NOT applied for
            if (job.active && !alreadyApplied) {
              jobs.push({
                ...job,
                employerId: employer._id || '',
                companyName: employer.companyName
              });
            }
          });
        });

        console.log('[JobseekerListComponent] Final jobs after filtering:', jobs);
        this.allJobs = jobs;
        this.jobs = jobs;
        this.buildFilterOptions();
      },
      error: (err) => console.error('[JobseekerListComponent] Error loading jobs', err)
    });
  }

  private buildFilterOptions(): void {
    console.log('[JobseekerListComponent] Building filter options from jobs:', this.allJobs);
    const locations = new Set<string>();
    const jobTypes = new Set<string>();
    const categories = new Set<string>();

    this.allJobs.forEach(job => {
      if (job.location) {
        locations.add(job.location);
      }
      if (job.jobType) {
        jobTypes.add(job.jobType);
      }
      (job.categories || []).forEach(cat => categories.add(cat));
    });

    this.locations = Array.from(locations).sort();
    this.jobTypes = Array.from(jobTypes).sort();
    this.categories = Array.from(categories).sort();

    console.log('[JobseekerListComponent] locations:', this.locations);
    console.log('[JobseekerListComponent] jobTypes:', this.jobTypes);
    console.log('[JobseekerListComponent] categories:', this.categories);
  }

  onSearchChange(): void {
    console.log('[JobseekerListComponent] onSearchChange, term=', this.searchTerm);
    this.applyFilters();
  }

  onLocationChange(): void {
    console.log('[JobseekerListComponent] onLocationChange, location=', this.selectedLocation);
    this.applyFilters();
  }

  onJobTypeChange(): void {
    console.log('[JobseekerListComponent] onJobTypeChange, jobType=', this.selectedJobType);
    this.applyFilters();
  }

  onCategoryChange(): void {
    console.log('[JobseekerListComponent] onCategoryChange, category=', this.selectedCategory);
    this.applyFilters();
  }

  clearFilters(): void {
    console.log('[JobseekerListComponent] clearFilters');
    this.searchTerm = '';
    this.selectedLocation = '';
    this.selectedJobType = '';
    this.selectedCategory = '';
    this.jobs = [...this.allJobs];
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    console.log('[JobseekerListComponent] applyFilters with term=', term,
      'location=', this.selectedLocation,
      'jobType=', this.selectedJobType,
      'category=', this.selectedCategory
    );

    this.jobs = this.allJobs.filter(job => {
      let matches = true;

      if (term) {
        const text = (job.title + ' ' + job.companyName).toLowerCase();
        matches = matches && text.includes(term);
      }

      if (this.selectedLocation) {
        matches = matches && job.location === this.selectedLocation;
      }

      if (this.selectedJobType) {
        matches = matches && job.jobType === this.selectedJobType;
      }

      if (this.selectedCategory) {
        matches = matches && (job.categories || []).includes(this.selectedCategory);
      }

      return matches;
    });

    console.log('[JobseekerListComponent] Jobs after applyFilters:', this.jobs);
  }

  getSalaryRange(job: JobWithEmployer): string {
    if (!job.salary) {
      return '';
    }
    const range = `${job.salary?.currency} ${job.salary?.min?.toLocaleString() ?? 'N/A' } - ${ job.salary?.max?.toLocaleString() ?? 'N/A' }`;
    console.log('[JobseekerListComponent] getSalaryRange for job', job.jobId, '=>', range);
    return range;
  }
}
