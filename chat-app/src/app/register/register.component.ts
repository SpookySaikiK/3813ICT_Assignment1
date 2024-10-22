import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  private readonly apiUrl: string = 'http://localhost:3000/registerUser';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        this.router.navigateByUrl('/profile');
      }
    }
  }
  //Method to clear the form fields
  clearForm(): void {
    this.username = '';
    this.email = '';
    this.password = '';
  }

  resetForm(): void {
    this.clearForm();
  }

  registerUser() {
    if (!this.username || !this.email || !this.password) {
      alert('All fields are required!');
      return;
    }
    if (this.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post<{ id: number, username: string, email: string, roles: string[], avatar: string, message: string }>(this.apiUrl, newUser).subscribe({
      next: (response) => {
        alert(response.message);
        this.router.navigateByUrl('/profile');
      },
      error: (error) => {
        if (error.status === 400) {
          alert('Username already exists!');
        } else {
          alert('An error occurred during registration. Please try again.');
        }
      }
    });
  }
}
