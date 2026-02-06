import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit, AfterViewInit {
  @ViewChild('reportChart') reportChartRef!: ElementRef<HTMLCanvasElement>;

  chart: any;
  income: number = 0;
  expenses: number = 0;
  balance: number = 0;
  budget: number = 0;
  selectedCategory = '';
  fromDate = '';
  toDate = '';
  categories = ['Food', 'Travel', 'Shopping', 'Jewellery'];
  employeeId!: number; 
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('employee_id');
    if (storedId) {
      this.employeeId = Number(storedId);
      console.log('Logged-in employee ID:', this.employeeId);
    } else {
      console.error('No employee ID found in localStorage');
      return;
    }
    this.fetchSummaryData();
    this.loadExpensePieChart();
    this.loadIncomeVsExpenseBarChart();
  }

  ngAfterViewInit(): void {
    this.createEmptyChart();
  }

  fetchSummaryData(): void {
    const url = `http://localhost:8000/fin/report/summary/${this.employeeId}/`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.income = data.income;
        this.expenses = data.expenses;
        this.balance = data.balance;
        this.budget = data.budget;
      },
      error: (err) => {
        console.error('Error fetching summary data', err);
      }
    });
  }

  loadExpensePieChart(): void {
    this.http.get<any>(`http://localhost:8000/fin/api/chart/${this.employeeId}/`)
      .subscribe(response => {
        const categories = Object.keys(response.expenses);
        const amounts = Object.values(response.expenses);
        new Chart("expensePieChart", {
          type: 'pie',
          data: {
            labels: categories,
            datasets: [{
              data: amounts,
              backgroundColor: ['#007bff', 'green', '#ffc107', '#dc3545', '#6f42c1'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
              title: { display: true, text: 'Expense Distribution by Category' }
            }
          }
        });
      });
  }

  loadIncomeVsExpenseBarChart(): void {
    this.http.get<any>(`http://localhost:8000/fin/income/expense/${this.employeeId}/`)
      .subscribe(response => {
        const categories = response.data.map((item: any) => item.category);
        const incomes = response.data.map((item: any) => item.income);
        const expenses = response.data.map((item: any) => item.expense);

        new Chart("barChart", {
          type: 'bar',
          data: {
            labels: categories,
            datasets: [
              {
                label: 'Income',
                data: incomes,
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
              },
              {
                label: 'Expenses',
                data: expenses,
                backgroundColor: 'rgba(255, 99, 132, 0.7)'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Income vs Expenses by Category' }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      });
  }

createEmptyChart() {
  const ctx = this.reportChartRef.nativeElement.getContext('2d');
  this.chart = new Chart(ctx!, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Income',
          data: [],
          borderColor: 'green',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Expense',
          data: [],
          borderColor: 'red',
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Income vs Expense' }
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 50000,        
          ticks: {
            stepSize: 500   
          }
        }
      }
    }
  });
}


  loadData() {
    if (!this.selectedCategory || !this.fromDate || !this.toDate) {
      alert('Please fill all fields');
      return;
    }

    const categoryMap: { [key: string]: number } = {
      'Food': 1,
      'Jewellery': 2,
      'Travel': 3,
      'Shopping': 4,
    };

    const categoryId = categoryMap[this.selectedCategory];
    if (!categoryId) {
      alert('Invalid category selected');
      return;
    }

    const url = `http://localhost:8000/fin/api/monthly/category/${this.employeeId}/${categoryId}/`;

    this.http.get<any>(url).subscribe((res) => {
      const income = res.income;
      const expense = res.expense;

      const allDatesSet = new Set<string>();
      income.forEach((i: any) => allDatesSet.add(i.expenses_date));
      expense.forEach((e: any) => allDatesSet.add(e.expenses_date));

      const allDates = Array.from(allDatesSet).sort();
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);

      const filteredDates = allDates.filter(date => {
        const current = new Date(date);
        return current >= from && current <= to;
      });

      const incomeMap: any = {};
      const expenseMap: any = {};
      income.forEach((i: any) => incomeMap[i.expenses_date] = i.amount);
      expense.forEach((e: any) => expenseMap[e.expenses_date] = e.amount);

      const incomeData = filteredDates.map(date => incomeMap[date] || 0);
      const expenseData = filteredDates.map(date => expenseMap[date] || 0);

      console.log('From Date:', this.fromDate);
      console.log('To Date:', this.toDate);
      console.log('Filtered Dates:', filteredDates);
      console.log('Income Data:', incomeData);
      console.log('Expense Data:', expenseData);

      if (this.chart) {
        this.chart.data.labels = filteredDates;
        this.chart.data.datasets[0].data = incomeData;
        this.chart.data.datasets[1].data = expenseData;
        this.chart.update();
      } else {
        console.error('Chart not initialized.');
      }
    });
  }
}
