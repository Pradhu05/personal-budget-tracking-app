import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chart } from 'chart.js';

@Injectable({
  providedIn: 'root',
  
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/fin/api/dashboard/';
  chart: any;
  employeeId=1;

  constructor(private http: HttpClient) {}
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
   loadExpensePieChart(): void {
      this.http.get<any>(`http://localhost:8000/fin/api/chart/expense/`)
        .subscribe(response => {
          const categories = Object.keys(response.expenses);
          const amounts = Object.values(response.expenses);
          this.chart = new Chart("expensePieChart", {
            type: 'pie',
            data: {
              labels: categories,
              datasets: [{
                data: amounts,
                backgroundColor: [
                  '#007bff', 'green', '#ffc107', '#dc3545', '#6f42c1'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                },
                title: {
                  display: true,
                  text: 'Expense Distribution by Category'
                }
              }
            }
          });
        });
    }
    getIncomeVsExpenseLineChart(): Observable<any> {
  return this.http.get<any>('http://localhost:8000/fin/total/income/expenses/');
}

}
