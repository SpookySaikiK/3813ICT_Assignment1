import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  loggedInUser: any;
  selectedFile: File | null = null;
  avatarUrl: string = '';
  private readonly apiUrl: string = 'http://localhost:3000';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.loggedInUser = JSON.parse(user);
        this.avatarUrl = `http://localhost:3000/${this.loggedInUser.avatar || 'uploads/avatar/default-avatar.png'}`;
        this.setTheme(this.loggedInUser.theme);
      } else {
        this.loggedInUser = {};
        this.router.navigateByUrl('/login');
      }
    }
  }

  setTheme(theme: string): void {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      console.log('Dark mode enabled:', document.body.classList.contains('dark-mode'));
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode disabled:', !document.body.classList.contains('dark-mode'));
    }
  }

  toggleTheme(): void {
    //Toggle between 'light' and 'dark' themes
    const newTheme = this.loggedInUser.theme === 'light' ? 'dark' : 'light';
    this.loggedInUser.theme = newTheme;
  
    //Update the theme on the frontend
    localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));
    this.setTheme(newTheme);
  
    //Send the theme update to the server
    this.http.put(`${this.apiUrl}/updateUserTheme`, { username: this.loggedInUser.username, theme: newTheme }).subscribe({
      next: () => {
        console.log('Theme updated successfully on the server.');
      },
      error: (error) => {
        console.error('Error updating theme on the server:', error);
      }
    });
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadAvatar() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('avatar', this.selectedFile);
      formData.append('username', this.loggedInUser.username);

      this.http.post<{ avatarPath: string }>(`${this.apiUrl}/uploadAvatar`, formData).subscribe({
        next: (response) => {
          alert('Avatar updated successfully!');
          this.avatarUrl = `http://localhost:3000/${response.avatarPath}`;
          this.loggedInUser.avatar = response.avatarPath;
          localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));
        },
        error: (error) => {
          console.error('Error uploading avatar:', error);
          alert('There was an error uploading the avatar. Please try again later.');
        }
      });
    }
  }


  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigateByUrl('/login');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.http.delete(`${this.apiUrl}/deleteUser/${this.loggedInUser.username}`).subscribe({
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
