import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  //find users in local storage or if none empty array
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.users = JSON.parse(localStorage.getItem('users') || '[]');
    }
  }

  registerUser() {
    //check if the username is in use
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

    //add new user to list
    this.users.push(newUser);

    //push updated list back to local storage
    localStorage.setItem('users', JSON.stringify(this.users));
    alert('Registration successful!')


  }

  generateId() {
    return this.users.length + 1;

  }

}
