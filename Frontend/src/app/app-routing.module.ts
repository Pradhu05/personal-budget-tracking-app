import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginSiggupComponent } from './login-siggup/login-siggup.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { BudgetComponent} from './budget/budget.component';
import{ReportComponent} from './report/report.component';
import { EditExpenseComponent } from './edit-expense/edit-expense.component';
import { HelpComponent } from './help/help.component';

 const routes: Routes = [
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
      },
      {
        path: 'budget',
        component: BudgetComponent
      },
      {
        path:'personal/:id/edit',
        component:EditExpenseComponent
      },
      {
        path:'report',
        component:ReportComponent
      },
      {
        path:'help',
        component:HelpComponent
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
