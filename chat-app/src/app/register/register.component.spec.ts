import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to profile if user is already logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue('testuser');
    component.ngOnInit();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/profile');
  });

  it('should not allow registration if fields are missing', () => {
    spyOn(window, 'alert');
    component.username = '';
    component.email = '';
    component.password = '';

    component.registerUser();
    fixture.detectChanges();

    expect(window.alert).toHaveBeenCalledWith('All fields are required!');
  });

  it('should not allow registration if password is too short', () => {
    spyOn(window, 'alert');
    component.username = 'testuser';
    component.email = 'testuser@example.com';
    component.password = '123';

    component.registerUser();
    fixture.detectChanges();

    expect(window.alert).toHaveBeenCalledWith('Password must be at least 6 characters long!');
  });

  it('should clear form fields after successful registration', () => {
    component.username = 'testuser';
    component.email = 'testuser@example.com';
    component.password = 'password123';

    component.clearForm();

    expect(component.username).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });


  it('should navigate to login page after successful registration', () => {
    component.username = 'testuser';
    component.email = 'testuser@example.com';
    component.password = 'password123';

    //Simulate successful registration
    spyOn(component, 'registerUser').and.callFake(() => {
      routerSpy.navigateByUrl('/login');
    });

    component.registerUser();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should reset form fields when resetForm is called', () => {
    component.username = 'testuser';
    component.email = 'testuser@example.com';
    component.password = 'password123';

    component.resetForm();

    expect(component.username).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });
});
