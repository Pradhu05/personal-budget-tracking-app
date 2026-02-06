import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  totalEmployees = 0;
  totalBudgets = 0;
  totalAmount = 0;

  constructor(private dashboardService: DashboardService) {}
  ngOnInit(){
    this.dashboardService.getDashboardStats().subscribe(data => {
      this.totalEmployees = data.total_employees;
      this.totalBudgets = data.total_budgets;
      this.totalAmount = data.total_amount;
    });
  }
}
