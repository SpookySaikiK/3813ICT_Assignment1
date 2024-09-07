import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  users: any[] = [];

  constructor(private router: Router) { };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        this.router.navigateByUrl('/profile')
      }
      this.users = JSON.parse(localStorage.getItem('users') || '[]');
    }
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
    if (this.users.find((user: any) => user.username === this.username)) {
      alert('Username already exists!');
      return;
    }

    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password,
      id: this.generateId(),
      roles: ['user'],
      groups: []
    }
    this.users.push(newUser);

    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));

    alert('Registration successful!')
    this.router.navigateByUrl('/profile')
  }

  generateId() {
    return this.users.length + 1;
  }
}
