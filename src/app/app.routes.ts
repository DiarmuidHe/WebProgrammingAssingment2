import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployerList } from './employer-list-component/employer-list';
import { EmployerDetailComponent } from './employer-detail-component/employer-detail-component';
import { EmployerFormComponent } from './employer-form-component/employer-form-component';
import { LoginComponent } from './login-component/login-component';
import { JobseekerListComponent } from './jobseeker-list-component/jobseeker-list-component';
import { RegisterComponent } from './register-component/register-component';
import { JobseekerDetailComponent } from './jobseeker-detail-component/jobseeker-detail-component';
import { OauthComponenent } from './OAuth/oauth-componenent/oauth-componenent';
import { RoleGuard } from './auth/auth-guard';
export const routes: Routes = [
    { path: '', component: JobseekerListComponent }, 
    { path: 'employers', component: EmployerList },
    { path: 'employers/new', component: EmployerFormComponent },
    { path: 'employers/:id', component: EmployerDetailComponent },
    
    { path: 'jobseekers', component: JobseekerListComponent },
    { path: 'jobseekers/:employerId/:jobId', component: JobseekerDetailComponent },
    { path: 'login', component: LoginComponent },
    { path: 'oauth-callback', component: OauthComponenent },
    { path: 'register', component: RegisterComponent},
    // {
    //     path: 'jobseeker/dashboard',
    //     component: JobseekerDashboardComponent,
    //     canActivate: [RoleGuard],
    //     data: { roles: ['jobseeker'] }
    // },
    // {
    //     path: 'employer/dashboard',
    //     component: EmployerDashboardComponent,
    //     canActivate: [RoleGuard],
    //     data: { roles: ['employer'] }
    // }
];

