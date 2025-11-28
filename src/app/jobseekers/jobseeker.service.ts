import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobSeeker } from './jobseeker.interface';
import { Application } from '../aplications/application.interface';

@Injectable({
  providedIn: 'root'
})
export class JobSeekerService {

  private apiUrl = 'http://localhost:3000/api/v1/jobseeker';

  constructor(private http: HttpClient) { }

  getJobSeekers(): Observable<JobSeeker[]> {
    return this.http.get<JobSeeker[]>(this.apiUrl);
  }

  getJobSeekerById(id: string): Observable<JobSeeker> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<JobSeeker>(url);
  }

  createJobSeeker(jobSeeker: JobSeeker): Observable<JobSeeker> {
    return this.http.post<JobSeeker>(this.apiUrl, jobSeeker);
  }

  updateJobSeeker(id: string, jobSeeker: JobSeeker): Observable<JobSeeker> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<JobSeeker>(url, jobSeeker);
  }

  deleteJobSeeker(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  getApplications(jobSeekerId: string): Observable<Application[]> {
    const url = `${this.apiUrl}/${jobSeekerId}/applications`;
    return this.http.get<Application[]>(url);
  }

  addApplications(jobSeekerId: string, applications: Application[]): Observable<JobSeeker> {
    const url = `${this.apiUrl}/${jobSeekerId}/applications`;
    return this.http.post<JobSeeker>(url, { applications });
  }
}
