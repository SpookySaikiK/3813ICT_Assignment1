import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain navigation links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const links = compiled.querySelectorAll('nav ul li a');
    expect(links.length).toBe(5);
    expect(links[0].getAttribute('routerLink')).toBe('/chat');
    expect(links[1].getAttribute('routerLink')).toBe('/video-call');
    expect(links[2].getAttribute('routerLink')).toBe('/register');
    expect(links[3].getAttribute('routerLink')).toBe('/login');
    expect(links[4].getAttribute('routerLink')).toBe('/profile');
  });
});
