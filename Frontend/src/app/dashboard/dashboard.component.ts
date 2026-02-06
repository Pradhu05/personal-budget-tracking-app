import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  totalEmployees = 0;
  totalBudgets = 0;
  totalAmount = 0;
  lineChart:any;


  constructor(private dashboardService: DashboardService) {}
  ngOnInit(){
    this.dashboardService.loadExpensePieChart();
    this.dashboardService.getDashboardStats().subscribe(data => {
      this.totalEmployees = data.total_employees;
      this.totalBudgets = data.total_budgets;
      this.totalAmount = data.total_amount;
    });
    this.loadIncomeVsExpenseChart();
  }
   loadIncomeVsExpenseChart() {
   this.dashboardService.getIncomeVsExpenseLineChart().subscribe(data => {
  const income = data.income;
  const expense = data.expense;

  const incomeDates = income.map((i: { date: any; }) => i.date);
  const expenseDates = expense.map((e: { date: any; }) => e.date);

  const allDates = Array.from(new Set([...incomeDates, ...expenseDates])).sort();

  const incomeMap = new Map(income.map((i: { date: any; total: any; }) => [i.date, i.total]));
  const expenseMap = new Map(expense.map((e: { date: any; total: any; }) => [e.date, e.total]));

  const incomeValues = allDates.map(date => incomeMap.get(date) || 0);
  const expenseValues = allDates.map(date => expenseMap.get(date) || 0);

  new Chart("lineChartCanvas", {
    type: 'line',
    data: {
      labels: allDates,
      datasets: [
        {
          label: 'Income',
          data: incomeValues,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.2)',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Expense',
          data: expenseValues,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.2)',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: 'Spending Over Time (Line Chart)'
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Date' }
        },
        y: {
          title: { display: true, text: 'Amount' },
          beginAtZero: true
        }
      }
    }
  });
});
   }
   
  }