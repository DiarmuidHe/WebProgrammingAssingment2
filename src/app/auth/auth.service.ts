// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { JobSeeker } from '../jobseekers/jobseeker.interface';

const STORAGE_KEY = 'currentJobSeeker';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  /** Save the logged-in jobseeker in localStorage */
  setCurrentJobSeeker(jobSeeker: JobSeeker): void {
    
    //future implementation
    const data = {
      _id: jobSeeker._id,
      name: jobSeeker.name,
      email: jobSeeker.email
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  }

  /** Read the logged-in jobseeker from localStorage */
  getCurrentJobSeeker(): { _id: string; name: string; email: string } | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** Convenience: just the ID */
  getCurrentJobSeekerId(): string | null {
    const js = this.getCurrentJobSeeker();
    return js?._id ?? null;
  }

  /** Logout */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
