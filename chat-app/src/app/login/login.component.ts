import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  private readonly apiUrl: string = 'http://localhost:3000/loginUser';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        this.router.navigateByUrl('/profile');
      }
    }
  }

  loginUser(): void {
    if (!this.username || !this.password) {
      alert('Both username and password are required!');
      return;
    }
    const userCredentials = { username: this.username, password: this.password };

    this.http.post<{ message: string; username: string; useremail: string; usergroup: string; userrole: string }>(
      this.apiUrl,
      userCredentials
    ).subscribe({
      next: (response) => {
        //Save user information to local storage
        localStorage.setItem('loggedInUser', JSON.stringify(response));
        alert('Login successful!'); //Notify success
        this.router.navigateByUrl('/profile'); //Redirect to profile
      },
      error: (error) => {
        //Handle different error responses
        if (error.status === 404) {
          alert('User not found!');
        } else if (error.status === 401) {
          alert('Invalid password!');
        } else {
          alert('An error occurred during login. Please try again.');
        }
        this.password = '';
      }
    });
  }
}
