import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Employer } from '../employers/employer.interface';
import { EmployerService } from '../employers/employer.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCard } from '@angular/material/card';
import { MatCardContent } from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-employer-list',
    imports: [
    MatToolbar,
    MatCard,
    MatCardContent,
    MatProgressBar,
    MatTableModule,
    MatButtonModule
  ],
  standalone: true,
  templateUrl: './employer-list.html',
  styleUrls: ['./employer-list.scss']
})
export class EmployerList implements OnInit {

  displayedColumns: string[] = ['companyName', 'contactEmail', 'location', 'jobsCount', 'actions'];
  dataSource: MatTableDataSource<Employer> = new MatTableDataSource<Employer>([]);
  isLoading = false;
  errorMessage = '';

  constructor(
    private employerService: EmployerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEmployers();
  }

  loadEmployers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.employerService.getEmployers().subscribe({
      next: (employers) => {
        this.dataSource.data = employers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load employers.';
        this.isLoading = false;
      }
    });
  }

  getJobsCount(employer: Employer): number {
    return employer.jobs ? employer.jobs.length : 0;
  }

  onView(employer: Employer): void {
    if (!employer._id) {
      return;
    }
    this.router.navigate(['/employers', employer._id]);
  }

  onDelete(employer: Employer): void {
    if (!employer._id) {
      return;
    }
    if (!confirm(`Are you sure you want to delete employer "${employer.companyName}"?`)) {
      return;
    }
    this.employerService.deleteEmployer(employer._id).subscribe({
      next: () => this.loadEmployers(),
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to delete employer.';
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/employers/new']);
  }
}
