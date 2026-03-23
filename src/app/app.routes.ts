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
import { Forbidden } from './forbidden/forbidden';
import { AccountComponent } from './account-component/account-component';
import { AdminModerationPageComponent } from './admin/admin-moderation-page/admin-moderation-page.component';

export const routes: Routes = [
    { path: '', component: JobseekerListComponent }, 
    { path: 'employers', component: EmployerList },
    { path: 'employers/new', component: EmployerFormComponent },
    { 
        path: 'employers/:id', 
        component: EmployerDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: ['employer'] }
    },
    
    { path: 'jobseekers', component: JobseekerListComponent },
    { path: 'jobseekers/:employerId/:jobId', component: JobseekerDetailComponent },
    { path: 'login', component: LoginComponent },
    { path: 'oauth-callback', component: OauthComponenent },
    { path: 'register', component: RegisterComponent},
    { path: 'account', component: AccountComponent, canActivate: [RoleGuard], data: { roles: ['jobseeker', 'employer'] } },
    { path: 'admin', component: AdminModerationPageComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
    { path: 'forbidden', component: Forbidden }
];

