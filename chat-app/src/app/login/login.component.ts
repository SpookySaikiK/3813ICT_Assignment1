import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (loggedInUser) {
        this.router.navigateByUrl('/profile')
      }
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      let groups = JSON.parse(localStorage.getItem('groups') || '[]');
      if (users.length === 0) {
        const superUser = {
          id: 1,
          username: 'super',
          email: 'super@admin.com',
          password: '123',
          roles: ['superAdmin'],
          groups: []
        };
        const groupAdmin = {
          id: 2,
          username: 'groupAdmin',
          email: 'group@admin.com',
          password: '123',
          roles: ['groupAdmin'],
          groups: []
        };
        const user1 = {
          id: 3,
          username: 'user',
          email: 'user@admin.com',
          password: '123',
          roles: ['user'],
          groups: []
        };
        users.push(superUser);
        users.push(groupAdmin);
        users.push(user1)
        localStorage.setItem('users', JSON.stringify(users));
      }
      if (groups.length === 0) {
        const group1 = {
          id: 1,
          name: 'group',
          ownerName: 'groupAdmin',
          admins: [2],
          members: [2]
        }
        groups.push(group1)
        localStorage.setItem('groups', JSON.stringify(groups))
      }
    }
  }

  loginUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: any) => user.username === this.username && user.password === this.password);
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      alert('Login successful!')
      this.router.navigateByUrl('/profile')
    } else {
      alert('Invalid username or password!')
    }
  }
}
