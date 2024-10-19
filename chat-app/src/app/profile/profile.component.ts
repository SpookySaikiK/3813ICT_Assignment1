import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient , HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  loggedInUser: any;
  private readonly apiUrl: string = 'http://localhost:3000/deleteUser';

  constructor(private router: Router, private http: HttpClient) { }

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
      this.http.delete(`${this.apiUrl}/${this.loggedInUser.username}`).subscribe({
        next: () => {
          localStorage.removeItem('loggedInUser');
          alert('Account deleted successfully.');
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          alert('There was an error deleting your account. Please try again later.');
        }
      });
    }
  }
}
