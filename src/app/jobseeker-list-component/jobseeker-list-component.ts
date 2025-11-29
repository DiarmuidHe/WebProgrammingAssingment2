import { Component, OnInit, inject } from '@angular/core';
import { EmployerService } from '../employers/employer.service';
import { Employer } from '../employers/employer.interface';
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

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    this.employerService.getEmployers().subscribe({
      next: (employers: Employer[]) => {
        const jobs: JobWithEmployer[] = [];

        employers.forEach(employer => {
          (employer.jobs || []).forEach(job => {
            if (job.active) {
              jobs.push({
                ...job,
                employerId: employer._id || '',
                companyName: employer.companyName
              });
            }
          });
        });

        this.allJobs = jobs;
        this.jobs = jobs;
        this.buildFilterOptions();
      },
      error: (err) => console.error('Error loading jobs', err)
    });
  }

  private buildFilterOptions(): void {
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
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onLocationChange(): void {
    this.applyFilters();
  }

  onJobTypeChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLocation = '';
    this.selectedJobType = '';
    this.selectedCategory = '';
    this.jobs = [...this.allJobs];
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

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
  }

  getSalaryRange(job: JobWithEmployer): string {
    if (!job.salary) {
      return '';
    }
    return `${job.salary?.currency} ${job.salary?.min?.toLocaleString() ?? 'N/A' } - ${ job.salary?.max?.toLocaleString() ?? 'N/A' }`;
  }

}