import { HttpClient } from '@angular/common/http';
import { Component ,OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
   employeeId!: number;
  selectedCategoryId: number = 0;
  selectedCategoryData: any = null;
  showAddForm:boolean=false;
  showForm = false;
  budgetAlarm: boolean = false;
budgetAlarmMessage: string = '';


  newBudget = {
    employee_id: '',
    category_id: '',
    amount: ''
  };
  employees: any[] = [];
  categoryList = [
    { id: 1, category: 'food' },
    { id: 2, category: 'jewellery' },
    { id: 3, category: 'travel' },
    { id: 4, category: 'shopping' }
  ];
  showIncomeTable = false;
  showExpensesTable = false;
  incomeData: any[] = [];
  expensesData: any[] = [];
  income: number = 0;
  expense: number = 0;
  balance: number = 0;

   isDrawerOpen = false;
 showBudgetForm=false;
  constructor(private http: HttpClient,private snackBar: MatSnackBar) {}
  ngOnInit(): void {
     const storedId = localStorage.getItem('employee_id');
    if (storedId) {
      this.employeeId = Number(storedId);
      console.log('Logged-in employee ID:', this.employeeId);
    } else {
      console.error('No employee ID found in localStorage!');
    }
     this.fetchEmployees();
  }
  getCategoryData(categoryId: number) {
    this.selectedCategoryId = categoryId;
    const url = `http://127.0.0.1:8000/fin/category/summary/${this.employeeId}/${categoryId}/`;
    this.http.get<any>(url).subscribe(
      res => {
        console.log('Summary:', res);
        this.selectedCategoryData = res;
        this.showIncomeTable = false;
        this.showExpensesTable = false;
        this.incomeData = [];
        this.expensesData = [];
        this.loadCategorySummary(this.employeeId, categoryId);
      },
      error => {
        console.error('Error fetching category summary:', error);
      }
    );
  }

  loadCategorySummary(empId: number, categoryId: number) {
     const alarmUrl = `http://127.0.0.1:8000/fin/alarm/summary/${empId}/${categoryId}/`;
    this.http.get<any>(alarmUrl).subscribe(
      data => {
        this.income = data.income;
        this.expense = data.expense;
        this.balance = data.balance;
      this.budgetAlarm = data.alarm;
      this.budgetAlarmMessage = data.alarm_message;
      const panelClass = data.alarm ? 'error-snackbar' : 'success-snackbar';
    const message = data.alarm_message || 'Your budget is safe.';

    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });

  }, error => {
    console.error('Error loading category summary', error);
  });
}

   fetchEmployees() {
    this.http.get<any[]>('http://localhost:8000/fin/employee/').subscribe({
      next: (res) => {
        this.employees = res;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  submitBudget() {
    const payload = {
      employee_id: this.employeeId,
      category_id: this.newBudget.category_id,
      status_key: 3,
      amount: this.newBudget.amount
    };
    this.http.post('http://localhost:8000/fin/budget/', payload).subscribe({
      next: (res) => {
        this.snackBar.open('Budget created successfully!', 'Close', {
    duration: 3000,
    horizontalPosition: 'right',  
    verticalPosition: 'top',   
    panelClass: ['success-snackbar']
  });
        this.showForm = false;
        this.newBudget = { employee_id: '', category_id: '', amount: ''};
      },
      error: (err) => {
        console.error('Error submitting budget:', err);
         this.snackBar.open('Error creating budget. Please try again.', 'Close', {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  });
      }
    });
  }

  cancel() {
    this.showForm = false;
  }

  fetchIncomeDetails() {
  const empId = this.employeeId;
  const categoryId = this.selectedCategoryId;

  this.http.get<any>(`http://127.0.0.1:8000/fin/api/inc/${empId}/${categoryId}/`).subscribe(
    response => {
      console.log('Income response:', response);
      this.incomeData = response.entries; 
      this.showIncomeTable = true;
    },
    error => {
      console.error('Failed to fetch income data', error);
    }
  );
}

fetchExpensesDetails() {
  const empId = this.employeeId;
  const categoryId = this.selectedCategoryId;

  this.http.get<any>(`http://127.0.0.1:8000/fin/api/exp/${empId}/${categoryId}/`).subscribe(
    response => {
      console.log('Expense response:', response);
      this.expensesData = response.entries;  
      this.showExpensesTable = true;
    },
    error => {
      console.error('Failed to fetch expenses data', error);
    }
  );
}
}
