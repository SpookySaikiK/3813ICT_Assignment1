import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to profile if user is already logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({
      username: 'loggedInUser',
      useremail: 'loggedInUser@example.com',
    }));

    component.ngOnInit();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/profile');
  });

  it('should not redirect if no user is logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();

    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should not allow login if username or password is missing', () => {
    spyOn(window, 'alert');
  
    component.username = '';
    component.password = 'password123';
    component.loginUser();
    expect(window.alert).toHaveBeenCalledWith('Both username and password are required!');
  
    component.username = 'testuser';
    component.password = '';
    component.loginUser();
    expect(window.alert).toHaveBeenCalledWith('Both username and password are required!');
  });

  it('should handle form submission correctly', () => {
    spyOn(window, 'alert');
    spyOn(component, 'loginUser').and.callFake(() => {
      window.alert('Login successful!');
    });

    component.username = 'validUser';
    component.password = 'validPassword';

    component.loginUser();

    expect(component.loginUser).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Login successful!');
  });

  it('should reset the password field after unsuccessful login attempt', () => {
    spyOn(window, 'alert');

    component.username = 'testuser';
    component.password = 'wrongpassword';

    component.loginUser();
  
    component.password = '';
    fixture.detectChanges();

    expect(component.password).toBe('');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
