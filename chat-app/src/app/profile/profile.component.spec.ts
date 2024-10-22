import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    //Mock localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'loggedInUser') {
        return JSON.stringify({
          username: 'testuser',
          theme: 'light',
          avatar: 'uploads/avatar/default-avatar.png',
        });
      }
      return null;
    });
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the ProfileComponent', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to login if no user is logged in', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    fixture.detectChanges();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should log out and redirect to login', () => {
    fixture.detectChanges();
    component.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('loggedInUser');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should toggle theme and update localStorage', () => {
    fixture.detectChanges();

    component.loggedInUser = {
      username: 'testuser',
      theme: 'light'
    };
    component.toggleTheme();

    expect(component.loggedInUser.theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('loggedInUser', jasmine.any(String));
  });

  it('should switch to dark mode in the document body when theme is dark', () => {
    fixture.detectChanges();

    component.setTheme('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  it('should switch to light mode in the document body when theme is light', () => {
    fixture.detectChanges();

    component.setTheme('light');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  it('should select a file on file input', () => {
    const file = new File([''], 'test-avatar.png');
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
  });

  it('should not upload avatar if no file is selected', () => {
    spyOn(window, 'alert');

    component.selectedFile = null;
    component.uploadAvatar();

    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should not delete account if deletion is canceled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteAccount();

    expect(httpMock.match(() => true).length).toBe(0);
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });
});
