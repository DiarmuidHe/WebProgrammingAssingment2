export interface Salary {
  currency: string;
  min?: number;
  max?: number;
  period: string; // 'year' | 'month' | 'hour' etc.
}

export interface Job {
  jobId: string;
  title: string;
  description: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'remote' | 'contract';
  active: boolean;
  postedAt: string;  
  categories: string[];
  salary?: Salary;     
}

