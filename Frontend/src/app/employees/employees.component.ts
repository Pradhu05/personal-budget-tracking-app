import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../services/employee.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  categoryList: any[] = [];
 selectedEmployee: number | null = null;
  selectedCategory: string = '';
  expenseList: any[] = [];
   loggedInUser: any = null;
  searchQuery: string = '';
 allExpenses: any[] = [];
  filteredExpenses: any[] = [];
  dob: string = '';
  doj: string = '';
 empId: number = 0;

  newExpense: {
  id: number | null;
  employee_id: string;
  category: string;
  amount: string;
  expenses_date: string;
} = {
  id: null,
  employee_id: '',
  category: '',
  amount: '',
  expenses_date: ''
};

editingExpense: any = null;
  showAddForm: boolean = false;
  isUpdateMode: boolean = false;
  expenses: any[] | undefined;
  entries: any;

  constructor(private employeeService: EmployeeService,private snackBar :MatSnackBar) {}
  ngOnInit(): void {
  let emp = localStorage.getItem('employee_id');
  this.employeeService.getEmployeeExpenses(emp).subscribe((data: any) => {
    this.employees.push(data);
    const storedEmpId = localStorage.getItem('emp_id');
    if (storedEmpId) {
      this.empId = +storedEmpId;
       this.newExpense.employee_id = storedEmpId;
      this.loadEmployeeExpenses(this.empId);
      this.loadEmployees();
    this.loadCategories();  
    }
  });
  this.getCategories();
}
getCombinedEntries(empId: number, categoryId: number) {
  this.employeeService.getCombinedEntries(empId, categoryId).subscribe(
    (response: any) => {
      this.expenseList = response.entries;
      console.log('Combined data:', this.expenseList); 
    },
    (error) => {
      console.error('Error fetching combined data:', error);
    }
  );
}
getEmployeeNameById(id: number): string {
  const emp = this.employees.find(e => e.id === id);
  return emp ? `${emp.firstname} ${emp.lastname}` : '';
}

getCategoryNameById(id: number): string {
  const cat = this.categoryList.find(c => c.id === id);
  return cat ? cat.category : '';
}
loadEmployeeExpenses(empId: number) {
    this.employeeService.getEmployeeExpenses(empId).subscribe({
      next: (data) => {
        this.expenses = data;
      },
      error: (err) => {
        console.error('Error fetching employee history:', err);
      }
    });
}
loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(data => {
      this.employees = data;
    });
  }
  loadCategories(): void {
    this.employeeService.getAllCategories().subscribe(data => {
      this.categoryList = data;
    });
  }
  getCategories(): void {
    this.employeeService.getAllCategories().subscribe({
      next: (data) => {
        this.categoryList = data;
        this.expenseList = [];
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }
filterExpenses(): void {
    if (this.selectedEmployee !== null) {
      this.employeeService.getExpensesByEmployee(this.selectedEmployee).subscribe(data => {
        let filtered = data;
        if (this.selectedCategory) {
          filtered = filtered.filter((expense: any) =>
            expense.category.toLowerCase() === this.selectedCategory.toLowerCase()
          );
        }
        this.expenseList = filtered;
      });
    } else {
      this.expenseList = []; 
    }
  }
  submitAddExpense(): void {
    if (!this.newExpense.employee_id || !this.newExpense.category || !this.newExpense.amount || !this.newExpense.expenses_date) {
      alert('Please fill all fields');
      return;
    }
    const expenseData = {
      employee_id: this.newExpense.employee_id,
      category: this.newExpense.category,
      amount: this.newExpense.amount,
      expenses_date: this.newExpense.expenses_date
    };
    this.employeeService.addExpense(expenseData).subscribe({
      next: (res:any) => {
       this.snackBar.open(' created successfully!', 'Close', {
    duration: 3000,
    horizontalPosition: 'right',  
    verticalPosition: 'top',   
    panelClass: ['success-snackbar']
  });
        const employee = this.employees.find(e => e.id.toString() === this.newExpense.employee_id.toString());
        const category = this.categoryList.find(c => c.category.toString() === this.newExpense.category.toString());

        this.expenseList.unshift({
          id: res.id, 
          employee: employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown',
          category: category ? category.category : 'Unknown',
          amount: this.newExpense.amount,
          expenses_date: this.newExpense.expenses_date
        });
        this.resetForm();
      },
      error: (err) => {
        console.error('Error adding expense:', err);
        this.snackBar.open('fail to add expenses. Please try again.', 'Close', {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  });
      }
    });
  }
  submitUpdateExpense(): void {
    if (!this.newExpense.id || !this.newExpense.category || !this.newExpense.amount || !this.newExpense.expenses_date) {
      alert('Please fill all fields');
      return;
    }
    const expenseData = {
      category: this.newExpense.category,
      amount: this.newExpense.amount,
      expenses_date: this.newExpense.expenses_date
    };
    this.employeeService.updateExpense(this.newExpense.id, expenseData).subscribe({
      next: () => {
        this.snackBar.open(' Update successfully!', 'Close', {
    duration: 3000,
    horizontalPosition: 'right',  
    verticalPosition: 'top',   
    panelClass: ['success-snackbar']
  });
        this.refreshExpenseList();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error updating expense:', err);
        this.snackBar.open('Error update failed. Please try again.', 'Close', {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  });
      }
    });
  }
  resetForm(): void {
    this.newExpense = { id: null, employee_id: '', category: '', amount: '', expenses_date: '' };
    this.showAddForm = false;
    this.isUpdateMode = false;
  }
  refreshExpenseList(): void {
    if (this.selectedEmployee) {
      this.filterExpenses();
    }
  }
  onEmployeeChange(): void {
    if (this.selectedEmployee) {
      this.employeeService.getExpensesByEmployee(this.selectedEmployee).subscribe(data => {
        this.allExpenses = data;
        this.applyFilters(); 
      });
    } else {
      this.expenseList = [];
    }
  }
applyFilters(): void {
  let categoryId: number | null = null;
  if (this.selectedCategory) {
    const selectedCat = this.categoryList.find(c => c.category.toLowerCase() === this.selectedCategory.toLowerCase());
    if (selectedCat) {
      categoryId = selectedCat.id;
    }
  }
  if (this.selectedEmployee && categoryId !== null) {
    this.getCombinedEntries(Number(this.selectedEmployee), categoryId);
  } else {
    this.expenseList = [];
  }

  this.expenseList = this.allExpenses.filter(expense => {
    const matchesCategory = this.selectedCategory ? expense.category === this.selectedCategory : true;
    return matchesCategory;
  });
}

onCategoryChange(): void {
  this.filterExpenses();
}
  submitForm(): void {
  if (this.isUpdateMode) {
    this.submitUpdateExpense();
  } else {
    this.submitAddExpense();
  }
}
editExpense(expense: any): void {
  this.editingExpense = { ...expense }; 
  console.log("check",this.editingExpense)
}
onExpenseUpdated(): void {
  this.editingExpense = null;
  this.refreshExpenseList();
}
deleteExpense(id: number): void {
  if (confirm('Are you sure you want to delete ?')) {
    this.employeeService.deleteExpense(id).subscribe({
      next: () => {
        alert('Employee deleted successfully.');
        this.loadEmployeeExpensess(); 
      },
      error: (error) => {
        console.error(error);
        alert('Failed to delete .');
      }
    });
  }
}
  loadEmployeeExpensess() {
    if (this.empId) {
    this.loadEmployeeExpenses(this.empId);
  }
  }
  exportToExcel(): void {
  const exportData = this.expenseList.map(exp => ({
    'Employee Name': exp.employee,
    'Date': exp.expenses_date,
    'Category': exp.category,
    'Amount (₹)': exp.amount
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'RecentActivity': worksheet },
    SheetNames: ['RecentActivity']
  };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(data, 'Recent_Activity.xlsx');
}

}                                                                                                                                                                                