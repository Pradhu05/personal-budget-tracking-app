import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';  
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { LoginSiggupComponent } from './Pages/login-siggup/login-siggup.component';
import { LayoutComponent } from './Pages/layout/layout.component';
import { EmployeesComponent } from './Pages/employees/employees.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { DashboardService } from './services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoginSiggupComponent,  
    LayoutComponent,     
    EmployeesComponent,   
    DashboardComponent    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
