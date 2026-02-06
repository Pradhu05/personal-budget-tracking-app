import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LayoutComponent } from './layout/layout.component';
import { EmployeesComponent } from './employees/employees.component'; 
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginSiggupComponent } from './login-siggup/login-siggup.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BudgetComponent } from './budget/budget.component';
import { FilterByNamePipe } from './filter-by-name.pipe';
import { EditExpenseComponent } from './edit-expense/edit-expense.component';
import { ReportComponent } from './report/report.component';
import { HelpComponent } from './help/help.component';



@NgModule({
  declarations: [AppComponent,LayoutComponent,EmployeesComponent,DashboardComponent,LoginSiggupComponent, BudgetComponent, FilterByNamePipe, EditExpenseComponent, ReportComponent, HelpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule ,
     HttpClientModule,
     RouterModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
