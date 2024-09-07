import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {
  loggedInUser: any;

  constructor(private router: Router) { };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.loggedInUser = JSON.parse(user);
      } else {
        this.loggedInUser = {};
        this.router.navigateByUrl('/login');
      }
    }
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigateByUrl('/login');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (this.loggedInUser) {
        const updatedUsers = users.filter((user: { id: string }) => user.id !== this.loggedInUser.id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.removeItem('loggedInUser');
        this.router.navigateByUrl('/login');
      }
    }
  }
}