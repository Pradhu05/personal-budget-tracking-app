import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  getAllExpenses() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://127.0.0.1:8000/fin/view/'; 
  constructor(private http: HttpClient) {}
   getEmployees(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getEmployeeExpenses(empId:any): Observable<any[]> {
  return this.http.get<any[]>(`http://127.0.0.1:8000/fin/employee/${empId}/`);
}

  getAllCategories(): Observable<any[]> {
  return this.http.get<any[]>('http://127.0.0.1:8000/fin/categories/'); 
}
addExpense(expenseData: any) {
  return this.http.post('http://127.0.0.1:8000/fin/api/expense/add/', expenseData);
}
getExpensesByEmployee(employeeId: number,): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:8000/fin/api/expenses/${employeeId}/`);
  }
getCombinedEntries(empId: number, categoryId: number): Observable<any> {   
  return this.http.get(`http://127.0.0.1:8000/fin/api/combine/${empId}/${categoryId}/`);
}

updateExpense(expenseId: number, data: any): Observable<any> {
  return this.http.put(`http://127.0.0.1:8000/fin/expense/update/${expenseId}/`, data);
}
deleteExpense(id: number): Observable<any> {
  return this.http.delete(`http://127.0.0.1:8000/fin/expenses/delete/${id}/`);
}
}