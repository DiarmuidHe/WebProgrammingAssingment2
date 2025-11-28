import { Job } from "../jobs/job.interface";

export interface Employer {
  _id?: string;
  companyName: string;
  contactEmail: string;
  description: string;
  location: string;
  logo?: string;
  jobs: Job[];
}
