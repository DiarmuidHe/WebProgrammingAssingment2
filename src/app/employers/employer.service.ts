import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employer } from './employer.interface';
import { Job } from '../jobs/job.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployerService {

  private apiUrl = 'http://localhost:3000/api/v1/employers';

  constructor(private http: HttpClient) { }

  getEmployers(): Observable<Employer[]> {
    return this.http.get<Employer[]>(this.apiUrl);
  }

  getEmployerById(id: string): Observable<Employer> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Employer>(url);
  }

  createEmployer(employer: Employer): Observable<Employer> {
    return this.http.post<Employer>(this.apiUrl, employer);
  }

  deleteEmployer(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  getJobsByEmployerId(employerId: string): Observable<Job[]> {
    const url = `${this.apiUrl}/${employerId}/jobs`;
    return this.http.get<Job[]>(url);
  }

  getJobByJobId(employerId: string, jobId: string): Observable<Job> {
    const url = `${this.apiUrl}/${employerId}/jobs/${jobId}`;
    return this.http.get<Job>(url);
  }

  addJobs(employerId: string, jobs: Job[]): Observable<Employer> {
    const url = `${this.apiUrl}/${employerId}/jobs`;
    return this.http.post<Employer>(url, { jobs });
  }

  toggleJobActive(employerId: string, jobId: string, active: boolean): Observable<Job> {
    const url = `${this.apiUrl}/${employerId}/jobs/${jobId}/active`;
    return this.http.patch<Job>(url, { active });
  }
}
