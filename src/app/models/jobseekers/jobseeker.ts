import { Application } from "../aplications/application";

export interface JobSeeker {
  _id?: string;
  name: string;
  email: string;
  password: string;
  skills: string[];
  applications: Application[];
}
