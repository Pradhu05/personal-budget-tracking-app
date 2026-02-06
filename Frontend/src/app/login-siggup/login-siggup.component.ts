import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-siggup',
  templateUrl: './login-siggup.component.html',
  styleUrls: ['./login-siggup.component.css']
})
export class LoginSiggupComponent {
  activeForm: 'login' | 'register' = 'login';
  registerObj: registerModel = new registerModel();
  loginObj: loginModel = new loginModel();
  forgotPasswordMode: boolean = false;
   forgotEmail: string = '';
  newPassword: string = '';

  constructor(
    private _snackbar: MatSnackBar,
    private _router: Router,
    private http: HttpClient
  ) {}

  toggleForm(form: 'login' | 'register') {
    this.activeForm = form;
    this.forgotPasswordMode = false; 
  }

  registerForm() {
    if (
      !this.registerObj.username.trim() ||
      !this.registerObj.email.trim() ||
      !this.registerObj.password.trim()
    ) {
      this._snackbar.open('All fields are required!', 'Close');
      return;
    }
    const newUser = {
      firstname: this.registerObj.username,
      lastname: '', 
      age: 60, 
      dateofbirth: '2000-01-01', 
      dateofjoining: '2025-01-01', 
      category: 'food', 
      description: 'default description',
      email: this.registerObj.email,
      password: this.registerObj.password
    };
    this.http.post<any>('http://localhost:8000/fin/create_employee/', newUser).subscribe({
      next: (res) => {
        this._snackbar.open('User registered successfully', 'Close');
        this.registerObj = new registerModel();
        this.toggleForm('login');
      },
      error: (err) => {
        this._snackbar.open('Registration failed', 'Close');
      }
    });
  }
  loginForm() {
    if (!this.loginObj.email.trim() || !this.loginObj.password.trim()) {
      this._snackbar.open('Email and password are required!', 'Close');
      return;
    }
    const loginData = {
      email: this.loginObj.email,
      password: this.loginObj.password
    };
    this.http.post<any>('http://localhost:8000/fin/auth_token/', loginData).subscribe({
      next: (res) => {
        this._snackbar.open('Login successful!', 'Close');
        localStorage.setItem('employee_id', res.employee_id);
        localStorage.setItem('employee_name', res.firstname + ' ' + res.lastname);
        localStorage.setItem('employee_email', res.email);
        this._router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this._snackbar.open(err.error.error || 'Login failed', 'Close');
      }
    });
  }
  resetPassword() {
    if (!this.forgotEmail.trim() || !this.newPassword.trim()) {
      this._snackbar.open('Please enter both email and new password', 'Close');
      return;
    }

    this.http.post<any>('http://localhost:8000/fin/reset/password/', {
      email: this.forgotEmail,
      new_password: this.newPassword
    }).subscribe({
      next: (res) => {
        this._snackbar.open('Password reset successful!', 'Close');
        this.forgotEmail = '';
        this.newPassword = '';
        this.forgotPasswordMode = false;
      },
      error: (err) => {
        this._snackbar.open(err.error.error || 'Reset failed', 'Close');
      }
    });
  }
  logout() {
    localStorage.clear();
    this._router.navigateByUrl('/loginsignup');
  }
}

export class registerModel {
  username: string;
  email: string;
  password: string;

  constructor() {
    this.username = '';
    this.email = '';
    this.password = '';
  }
}

export class loginModel {
  email: string;
  password: string;

  constructor() {
    this.email = '';
    this.password = '';
  }
}
