import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoCallComponent } from './video-call.component';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';
import Peer from 'peerjs';

describe('VideoCallComponent', () => {
  let component: VideoCallComponent;
  let fixture: ComponentFixture<VideoCallComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockPeer: jasmine.SpyObj<Peer>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    mockPeer = jasmine.createSpyObj('Peer', ['on', 'call']);

    await TestBed.configureTestingModule({
      imports: [VideoCallComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoCallComponent);
    component = fixture.componentInstance;

    //Mock local and remote video elements
    component.localVideoRef = new ElementRef(document.createElement('video'));
    component.remoteVideoRef = new ElementRef(document.createElement('video'));

    fixture.detectChanges();
  });

  it('should create the video call component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should initialize video elements after view init', () => {
    component.ngAfterViewInit();
    expect(component.localVideoElement).toBe(component.localVideoRef.nativeElement);
    expect(component.remoteVideoElement).toBe(component.remoteVideoRef.nativeElement);
  });

  it('should stop local stream', () => {
    const mockStream = {
      getTracks: jasmine.createSpy('getTracks').and.returnValue([{ stop: jasmine.createSpy('stop') }]),
    };

    component.localStream = mockStream as unknown as MediaStream;
    component.stopLocalStream();

    expect(mockStream.getTracks).toHaveBeenCalled();
    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
    expect(component.localStream).toBeNull();
  });

  it('should end the current call', () => {
    const mockCall = jasmine.createSpyObj('currentCall', ['close']);
    component.currentCall = mockCall;
    component.remoteVideoElement = component.remoteVideoRef.nativeElement;

    component.endCall();

    expect(mockCall.close).toHaveBeenCalled();
    expect(component.currentCall).toBeNull();
    expect(component.remoteVideoElement.srcObject).toBeNull();
  });

  it('should not end call if no current call exists', () => {
    component.currentCall = null;
    component.endCall();

    expect(component.currentCall).toBeNull();
  });
});
