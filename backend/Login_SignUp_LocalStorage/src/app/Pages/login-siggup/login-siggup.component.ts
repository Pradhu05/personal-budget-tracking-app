import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import{MatSnackBar} from '@angular/material/snack-bar';
import{Router} from '@angular/router';

@Component({
  selector: 'app-login-siggup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-siggup.component.html',
  styleUrls: ['./login-siggup.component.css']
})
export class LoginSiggupComponent {
  activeForm: 'login' | 'register' = 'register';
  registerObj: registerModel = new registerModel();
  loginObj: loginModel = new loginModel();

  constructor(private _snackbar:MatSnackBar,private _router:Router){}

  toggleForm(form: 'login' | 'register')
   {
    this.activeForm = form;
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
  const localusers = localStorage.getItem('users');
  if (localusers !== null) {
    const users = JSON.parse(localusers);
    users.push(this.registerObj);
    localStorage.setItem('users', JSON.stringify(users));
  } else {
    const users = [];
    users.push(this.registerObj);
    localStorage.setItem('users', JSON.stringify(users));
  }
  this._snackbar.open('User registered successfully', 'Close');
  this.registerObj = new registerModel(); // reset form
  this.toggleForm('login'); 
}

loginForm() {
  if (!this.loginObj.email.trim() || !this.loginObj.password.trim()) {
    this._snackbar.open('Email and password are required!', 'Close');
    return;
  }

  const localusers = localStorage.getItem('users');
  if (localusers !== null) {
    const users = JSON.parse(localusers);
    const isUserExist = users.find(
      (user: registerModel) =>
        user.email === this.loginObj.email &&
        user.password === this.loginObj.password
    );

    if (isUserExist !== undefined) {
      this._snackbar.open('Login successful', 'Close');
      this._router.navigateByUrl('/dashboard');
    } else {
      this._snackbar.open('Email or password is incorrect!', 'Close');
    }
  } else {
    this._snackbar.open('No users found. Please register first.', 'Close');
  }
}

logout() {
  localStorage.removeItem('loggedInUser');
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
