import { Routes } from '@angular/router';
import { EmployerList } from './employer-list/employer-list';
export const routes: Routes = [
    {path: '', redirectTo: '/employers', pathMatch: 'full' },
    { path: 'employers', component: EmployerList },
];