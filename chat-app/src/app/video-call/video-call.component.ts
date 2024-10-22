import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Peer from 'peerjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})

export class VideoCallComponent implements OnInit, OnDestroy {
  private peer: Peer | null = null;
  public peerId: string | null = null;
  private localStream: MediaStream | null = null;
  private currentCall: any = null;
  private screenStream: MediaStream | null = null;

  //Bind to video elements in the template
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  //HTML video elements
  localVideoElement: HTMLVideoElement | null = null;
  remoteVideoElement: HTMLVideoElement | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (!user) {
        this.router.navigateByUrl('/login');
      } else {
        this.initializePeer();
        this.getLocalMediaStream();
      }
    }
  }

  ngAfterViewInit(): void {
    this.localVideoElement = this.localVideoRef.nativeElement;
    this.remoteVideoElement = this.remoteVideoRef.nativeElement;
  }

  //Initialize PeerJS and get the peer ID
  initializePeer(): void {
    this.peer = new Peer({
      host: 'localhost',
      port: 3000,
      path: '/peerjs',
      secure: false
    });

    //store the peer ID
    this.peer.on('open', id => {
      this.peerId = id;
      console.log('Peer ID:', id);
    });

    //Handle incoming calls
    this.peer.on('call', call => {
      call.answer(this.localStream!);
      call.on('stream', (remoteStream: MediaStream) => {
        this.remoteVideoElement!.srcObject = remoteStream;
      });
      this.currentCall = call;
    });
  }

  //Get the local media stream
  getLocalMediaStream(): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.localStream = stream;
        this.localVideoElement!.srcObject = stream;
        this.localVideoElement!.muted = true;
      })
      .catch(err => {
        console.error('Failed to get local stream:', err);
      });
  }

  //Make a call to another peer using their Peer ID
  callPeer(remotePeerId: string): void {
    const stream = this.screenStream || this.localStream;
    if (!stream) {
      console.error('No stream available for calling.');
      return;
    }
  
    const call = this.peer!.call(remotePeerId, stream);
    call.on('stream', (remoteStream: MediaStream) => {
      this.remoteVideoElement!.srcObject = remoteStream;
    });
    this.currentCall = call;
  }

  startScreenShare(): void {
    navigator.mediaDevices.getDisplayMedia({ video: true }).then(screenStream => {
      this.screenStream = screenStream;
      this.localVideoElement!.srcObject = screenStream;
  
      //Replace the current call
      if (this.currentCall) {
        const sender = this.currentCall.peerConnection.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenStream.getTracks()[0]);
        }
      }
  
      //Stop screen share when the user stops sharing
      screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
    }).catch(err => {
      console.error('Failed to get display media:', err);
    });
  }
  

  //Stop screen sharing
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
  
      if (this.localStream) {
        this.localVideoElement!.srcObject = this.localStream;
        
        //Replace the screen share with the local video
        if (this.currentCall) {
          const sender = this.currentCall.peerConnection.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(this.localStream.getVideoTracks()[0]);
          }
        }
      }
    }
  }
  

  //End the current call
  endCall(): void {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
      console.log('Call ended');
      //Reset the remote video stream
      if (this.remoteVideoElement) {
        this.remoteVideoElement.srcObject = null;
      }
    }
  }

  //Stop all local media record
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      console.log('Local media stream stopped');
    }
  }

  //Cleanup resources when component is destroyed
  ngOnDestroy(): void {
    this.stopLocalStream();
    this.peer?.disconnect();
    this.peer?.destroy();
    this.endCall();
  }
}
