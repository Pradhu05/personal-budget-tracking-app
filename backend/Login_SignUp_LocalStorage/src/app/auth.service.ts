import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

 isLoggedIn(): boolean {
  const token = localStorage.getItem('access');
  return !!token;  
}

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('loggedUser');
    }
  }
}
