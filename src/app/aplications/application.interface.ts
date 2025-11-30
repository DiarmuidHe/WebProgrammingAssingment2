// src/app/models/application.interface.ts
export interface Application {
  employerId: string;
  jobId: string;
  appliedAt: string;         
  status?: string;            
  coverLetter?: string | null;
}
