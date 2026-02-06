import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  isDarkMode = false;
  username: string = '';
  isSidebarOpen = true;
  isMobileView = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const name = localStorage.getItem('employee_name') || '';
      if (name) this.username = name;

      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        this.applyDarkMode();
      }

      this.checkWindowSize();
      window.addEventListener('resize', () => this.checkWindowSize());
    }
  }

  checkWindowSize() {
    this.isMobileView = window.innerWidth < 768;
    this.isSidebarOpen = !this.isMobileView;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.applyDarkMode();
      localStorage.setItem('theme', 'dark');
    } else {
      this.removeDarkMode();
      localStorage.setItem('theme', 'light');
    }
  }

  applyDarkMode(): void {
    document.body.classList.add('bg-dark', 'text-white');
  }

  removeDarkMode(): void {
    document.body.classList.remove('bg-dark', 'text-white');
  }

  onLogOut() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loggedUser');
      this.router.navigateByUrl('/loginsiggup');
    }
  }
}
