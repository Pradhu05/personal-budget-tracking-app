import { Routes } from '@angular/router';
import { LoginSiggupComponent } from './Pages/login-siggup/login-siggup.component';
import { LayoutComponent } from './Pages/layout/layout.component';
import { EmployeesComponent } from './Pages/employees/employees.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'loginsiggup',
    pathMatch: 'full'
  },
  {
    path: 'loginsiggup',
    component: LoginSiggupComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',  
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'employees',
        component: EmployeesComponent
      }
    ]
  }
];
