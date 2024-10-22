import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockSocket: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    mockSocket = {
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on'),
      disconnect: jasmine.createSpy('disconnect')
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ChatComponent],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;

    //Mock socket.io initialization
    spyOn(component, 'initializeSocket').and.callFake(() => {
      component['socket'] = mockSocket;
    });

    fixture.detectChanges();
  });

  it('should create the chat component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should load groups, channels, and messages if user is logged in', () => {
    const mockUser = { username: 'testuser', id: 1 };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
    spyOn(component, 'loadGroups');
    spyOn(component, 'loadChannels');
    spyOn(component, 'loadMessages').and.returnValue(Promise.resolve());

    component.ngOnInit();

    expect(component.loggedInUser).toEqual(mockUser);
    expect(component.loadGroups).toHaveBeenCalled();
    expect(component.loadChannels).toHaveBeenCalled();
    expect(component.loadMessages).toHaveBeenCalled();
  });

  it('should call leaveChannel when switching groups', () => {
    component.loggedInUser = { username: 'testuser' };
    component.selectedChannelId = 1;

    spyOn(component['socket'], 'emit');
    component.selectGroup(2);

    expect(component['socket'].emit).toHaveBeenCalledWith('leaveChannel', {
      channelId: 1,
      username: 'testuser'
    });
    expect(component.selectedChannelId).toBeNull();
  });

  it('should handle file selection', () => {
    const mockFile = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const event = { target: { files: [mockFile] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(mockFile);
  });
  

  it('should show error if message is empty when sending message', () => {
    spyOn(component, 'setFeedbackMessage');
    component.newMessage = '';
    component.selectedChannelId = 1;
    component.sendMessage();

    expect(component.setFeedbackMessage).toHaveBeenCalledWith('Message cannot be empty.', 'error');
  });

  it('should not send message if no channel is selected', () => {
    spyOn(component, 'setFeedbackMessage');
    
    component.newMessage = 'Hello';
    component.selectedChannelId = null;
    
    component.sendMessage();
  
    expect(component.setFeedbackMessage).toHaveBeenCalledWith('Message cannot be empty.', 'error');
  });
  

  it('should clear feedback message immediately', () => {
    component.setFeedbackMessage('Test message', 'success');
    component.clearFeedbackMessage();

    expect(component.feedbackMessage).toBe('');
    expect(component.feedbackMessageType).toBe('');
  });
  
 
});
