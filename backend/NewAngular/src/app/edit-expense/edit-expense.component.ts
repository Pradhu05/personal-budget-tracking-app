import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.scss']
})
export class EditExpenseComponent implements OnInit {
  @Input() expense: any; 
  @Output() updated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  editedExpense: any = {}; 
  categoryList: any[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.editedExpense = { ...this.expense };
    this.employeeService.getAllCategories().subscribe({
      next: (data) => {
        this.categoryList = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  updateExpense(): void {
    const updateData = {
      category: this.editedExpense.category,
      amount: this.editedExpense.amount,
      expenses_date: this.editedExpense.expenses_date
    };

    this.employeeService.updateExpense(this.editedExpense.id, updateData).subscribe({
      next: () => {
        alert('Expense updated successfully!');
        this.updated.emit();
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update expense.');
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
