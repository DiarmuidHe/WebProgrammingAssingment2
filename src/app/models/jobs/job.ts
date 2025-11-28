export interface Salary {
  currency: string;
  min: number;
  max: number;
}

export interface Job {
  jobId: string;
  title: string;
  description: string;
  salary: Salary;
  location: string;
  jobType: string;
  active: boolean;
  categories: string[];
  postedAt: string; // ISO date string from backend
}
