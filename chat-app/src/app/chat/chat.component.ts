import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})

export class ChatComponent implements OnInit {
  groups: { id: number, name: string, ownerName: string, admins: number[], members: number[] }[] = [];
  allGroups: { id: number; name: string; ownerName: string; admins: number[]; members: number[] }[] = [];
  channels: { id: number, name: string, groupId: number }[] = [];

  messages: { channelId: number, username: string, text: string, avatar: string, timestamp: string, image?: string }[] = [];
  filteredMessages: { channelId: number, username: string, text: string, avatar: string, timestamp: string, image?: string }[] = [];

  newMessage: string = '';

  newGroupName: string = '';
  newChannelName: string = '';

  selectedGroupId: number | null = null;
  selectedChannelId: number | null = null;

  filteredChannels: { id: number, name: string, groupId: number }[] = [];

  requests: { username: string, reason: string, groupId: number }[] = [];
  joinRequestGroupName: string = '';
  showRequestForm: boolean = false;
  showViewRequestsForm: boolean = false;
  selectedPromotionRole: 'superAdmin' | 'groupAdmin' = 'groupAdmin';

  loggedInUser: any;
  showGroupForm: boolean = false;
  showChannelForm: boolean = false;

  showManageMembersForm: boolean = false;
  newMemberUsername: string = '';
  selectedMemberToRemove: number | null = null;

  feedbackMessage: string = '';
  feedbackMessageType: string = '';

  removeMemberUsername: string = '';

  banUserName: string = '';
  banReason: string = '';
  banReportsList: { channelId: number, username: string, reason: string }[] = [];
  bannedUsers: { channelId: number, username: string, reason: string }[] = [];
  showBanUserForm: boolean = false;
  showBanReportsForm: boolean = false;

  selectedFile: File | null = null;

  private socket: any;

  constructor(private router: Router, private http: HttpClient) {
    if (!this.socket) {
      this.initializeSocket();
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.loggedInUser = JSON.parse(user);
        this.loadGroups();
        this.loadChannels();
        this.loadMessages();
        this.loadRequests();
        this.loadBannedUsers();
      } else {
        this.loggedInUser = {};
        this.router.navigateByUrl('/login');
      }
    }
  }

  windowLoaded(): boolean {
    return typeof window !== 'undefined'
  }

  initializeSocket() {
    this.socket = io('http://localhost:3000');

    this.socket.on('message', (message: any) => {
      this.filteredMessages.push(message); //Add new message to the message list
      setTimeout(() => this.scrollToBottom(), 0); //Scroll to the bottom to see the latest message
    });
  }

  loadChannels() {
    if (this.selectedGroupId !== null) {
      this.http.get<{ id: number, name: string, groupId: number }[]>('http://localhost:3000/manageChannel')
        .subscribe({
          next: (data) => {
            //Filter channels based on the currently selected group
            this.channels = data.filter(channel => channel.groupId === this.selectedGroupId);
            //Exclude banned channels
            this.filteredChannels = this.channels.filter(channel =>
              !this.bannedUsers.some(ban => ban.channelId === channel.id && ban.username === this.loggedInUser.username)
            );
          },
          error: (error) => {
            console.error('Error loading channels:', error);
          }
        });
    }
  }


  loadMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.selectedChannelId !== null) {
        this.http.get<{ channelId: number, username: string, text: string, avatar: string, timestamp: string }[]>(`http://localhost:3000/manageMessages/${this.selectedChannelId}`)
          .subscribe({
            next: (data) => {
              this.filteredMessages = data;
              console.log('Loaded messages:', this.filteredMessages);
              resolve(); //Resolve promise when messages are loaded
            },
            error: (error) => {
              console.error('Error loading messages:', error);
              reject(error); //Reject promise if there is an error
            }
          });
      } else {
        resolve(); //If no channel is selected, resolve
      }
    });
  }




  loadGroups() {
    this.http.get<{ id: number; name: string; ownerName: string; admins: number[]; members: number[] }[]>('http://localhost:3000/manageGroup')
      .subscribe({
        next: (data) => {
          //Store all groups
          this.allGroups = data;
          //Filter groups for the logged-in user
          this.groups = data.filter(group =>
            group.members.includes(this.loggedInUser.id) || group.admins.includes(this.loggedInUser.id)
          );
          console.log('Loaded all groups:', this.allGroups);
        },
        error: (error) => {
          console.error('Error loading groups:', error);
        }
      });
  }


  selectGroup(groupId: number) {
    if (this.selectedChannelId !== null) {
      //Emit leave event for the current channel before switching group
      this.socket.emit('leaveChannel', {channelId: this.selectedChannelId, username: this.loggedInUser.username});
    }
    this.selectedGroupId = groupId;
    this.selectedChannelId = null;
    this.loadChannels();
  }


  selectChannel(channelId: number) {
    if (this.selectedChannelId == channelId){
      return
    }

    if (this.selectedChannelId !== null && this.selectedChannelId != channelId) {
      //Emit leave event for the current channel before switching channels
      this.socket.emit('leaveChannel', {channelId: this.selectedChannelId, username: this.loggedInUser.username});
    }
    
    this.selectedChannelId = channelId;

    //Load messages and scroll to the bottom after loading is complete
    this.loadMessages()
      .then(() => {
        this.socket.emit('joinChannel', {channelId: this.selectedChannelId, username: this.loggedInUser.username});
        setTimeout(() => {this.scrollToBottom()}, 50);
      })
      .catch((error: any) => {
        console.error('Failed to load messages:', error);
      });
  }

  sendMessage() {
    if (this.selectedChannelId !== null && this.newMessage.trim() !== '') {
      const messageData = {
        channelId: this.selectedChannelId,
        username: this.loggedInUser.username,
        avatar: 'http://localhost:3000/' + this.loggedInUser.avatar,
        text: " " + this.newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      this.socket.emit('sendMessage', { channelId: this.selectedChannelId, message: messageData });
      this.newMessage = '';
      setTimeout(() => this.scrollToBottom(), 0);
    } else {
      this.setFeedbackMessage('Message cannot be empty.', 'error');
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  //Send the selected image
  sendImage(): void {
    if (this.selectedChannelId !== null && this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('channelId', this.selectedChannelId.toString());
      formData.append('username', this.loggedInUser.username);

      //Send the image file to the server
      this.http.post<{ message: string, image: string }>('http://localhost:3000/uploadImage', formData)
        .subscribe({
          next: (response) => {
            console.log('Image sent successfully:', response.message);
            const imageMessage = {
              channelId: this.selectedChannelId,
              username: this.loggedInUser.username,
              avatar: 'http://localhost:3000/' + this.loggedInUser.avatar,
              text: '',
              image: response.image,
              timestamp: new Date().toISOString()
            };

            //Emit the message to the socket server to update in real time
            this.socket.emit('sendMessage', { channelId: this.selectedChannelId, message: imageMessage });

            //Clear Selection
            this.selectedFile = null;
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }

            setTimeout(() => this.scrollToBottom(), 50);
          },
          error: (error) => {
            console.error('Error sending image:', error);
          }
        });
    } else {
      console.error('No file selected or channel not selected');
    }
  }





  //Handle channel leave logic
  ngOnDestroy(): void {
    if (this.selectedChannelId) {
      this.socket.emit('leaveChannel', {channelId: this.selectedChannelId, username: this.loggedInUser.username});
    }
    this.socket.disconnect();
  }

  //Create-Delete Group
  createGroup() {
    if (this.newGroupName.trim() !== '' && this.isAdmin()) {
      const groupData = {
        name: this.newGroupName.trim(),
        ownerName: this.loggedInUser.username,
        adminId: this.loggedInUser.id
      };

      this.http.post<{ message: string }>('http://localhost:3000/manageGroup/create', groupData).subscribe({
        next: (response) => {
          alert(response.message);
          this.newGroupName = '';
          this.loadGroups();
        },
        error: (error) => {
          alert('Error creating group: ' + error.message);
        }
      });
    } else {
      alert('Group name is required!');
    }
  }

  // Delete Group Method
  deleteGroup(groupId: number) {
    this.http.delete<{ message: string }>(`http://localhost:3000/manageGroup/delete/${groupId}`).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadGroups(); //Reload groups after deletion
      },
      error: (error) => {
        alert('Error deleting group: ' + error.message);
      }
    });
  }

  showCreateGroupForm() {
    this.showGroupForm = true;
  }
  hideCreateGroupForm() {
    this.showGroupForm = false;
  }

  //Create-Delete Channel
  createChannel() {
    if (this.selectedGroupId !== null && this.newChannelName.trim() !== '' && this.isAdmin()) {
      const channelData = {
        name: this.newChannelName.trim(),
        groupId: this.selectedGroupId
      };

      this.http.post<{ message: string; channel: any }>('http://localhost:3000/manageChannel/create', channelData)
        .subscribe({
          next: (response) => {
            alert(response.message);
            this.newChannelName = '';
            this.loadChannels();
          },
          error: (error) => {
            alert('Error creating channel: ' + error.message);
          }
        });
    } else {
      alert('Channel name is required and a group must be selected!');
    }
  }

  deleteChannel(channelId: number) {
    if (this.isAdmin()) {
      this.http.delete<{ message: string }>(`http://localhost:3000/manageChannel/delete/${channelId}`).subscribe({
        next: (response) => {
          alert(response.message);
          this.loadChannels(); //Reload channels after deletion
        },
        error: (error) => {
          alert('Error deleting channel: ' + error.message);
        }
      });
    }
  }


  showCreateChannelForm() {
    this.showChannelForm = true;
  }
  hideCreateChannelForm() {
    this.showChannelForm = false;
  }

  //Leave Group
  leaveGroup() {
    if (this.selectedGroupId !== null) {
      const leaveData = {
        groupId: this.selectedGroupId,
        userId: this.loggedInUser.id
      };

      this.http.post<{ message: string }>('http://localhost:3000/manageGroup/leave', leaveData).subscribe({
        next: (response) => {
          alert(response.message); //Show success message
          this.loadGroups(); //Reload groups to reflect changes
          //Clear Selected
          this.selectedGroupId = null;
          this.selectedChannelId = null;
          this.filteredChannels = [];
          this.filteredMessages = [];
        },
        error: (error) => {
          alert(error.message);
        }
      });
    } else {
      alert('No group selected.');
    }
  }


  //Add-Remove Members
  addMember() {
    this.clearFeedbackMessage();
    if (this.selectedGroupId !== null && this.newMemberUsername.trim() !== '') {
      const memberData = {
        groupId: this.selectedGroupId,
        username: this.newMemberUsername.trim()
      };

      console.log('Adding member with data:', memberData);

      this.http.post<{ message: string }>('http://localhost:3000/manageGroup/addMember', memberData).subscribe({
        next: (response) => {
          this.setFeedbackMessage(response.message, 'success');
          this.newMemberUsername = '';
          this.loadGroups();
        },
        error: (error) => {
          this.setFeedbackMessage((error.error.message || error.message), 'error');
        }
      });
    } else {
      this.setFeedbackMessage('No group selected or username is empty.', 'error');
    }
  }

  removeMember() {
    this.clearFeedbackMessage();
    if (this.selectedGroupId !== null && this.removeMemberUsername.trim() !== '') {
      const memberData = {
        groupId: this.selectedGroupId,
        username: this.removeMemberUsername
      };

      console.log('Removing member with data:', memberData);

      this.http.post<{ message: string }>('http://localhost:3000/manageGroup/removeMember', memberData).subscribe({
        next: (response) => {
          this.setFeedbackMessage(response.message, 'success');
          this.loadGroups();
          this.removeMemberUsername = '';
        },
        error: (error) => {
          this.setFeedbackMessage((error.error.message || error.message), 'error');
        }
      });
    } else {
      this.setFeedbackMessage('No group selected or username is empty.', 'error');
    }
  }




  //Submit-View Join Request
  submitJoinRequest() {
    if (this.joinRequestGroupName.trim() !== '') {
      const group = this.allGroups.find(g => g.name === this.joinRequestGroupName.trim());
      if (group) {
        const isMember = group.members.includes(this.loggedInUser.id);
        if (isMember) {
          this.setFeedbackMessage('You are already a member of this group.', 'error');
          return;
        }
        const requestData = {
          groupId: group.id,
          username: this.loggedInUser.username,
          reason: 'has requested to join the group'
        };

        this.http.post<{ message: string }>('http://localhost:3000/manageRequests/request', requestData).subscribe({
          next: (response) => {
            this.setFeedbackMessage('Request sent!', 'success');
            this.loadRequests();
          },
          error: (error) => {
            this.setFeedbackMessage('Error sending request: ' + error.message, 'error');
          }
        });
      } else {
        this.setFeedbackMessage('No such Group exists.', 'error');
      }
    }
  }

  //Request
  requestAdminRights() {
    if (this.selectedGroupId !== null) {
      const group = this.allGroups.find(g => g.id === this.selectedGroupId);
      if (group) {
        const existingRequest = this.requests.find(request =>
          request.username === this.loggedInUser.username &&
          request.groupId === this.selectedGroupId &&
          request.reason.includes('requested admin rights')
        );
        if (existingRequest) {
          this.setFeedbackMessage('You already have a pending admin request for this group.', 'error');
        } else if (group.admins.includes(this.loggedInUser.id)) {
          this.setFeedbackMessage('You are already an admin of this group.', 'error');
        } else {
          const requestData = {
            groupId: this.selectedGroupId,
            username: this.loggedInUser.username,
            reason: 'has requested admin rights for this group'
          };

          this.http.post<{ message: string }>('http://localhost:3000/manageRequests/request', requestData).subscribe({
            next: (response) => {
              this.setFeedbackMessage('Admin request sent!', 'success');
              this.loadRequests();
            },
            error: (error) => {
              this.setFeedbackMessage('Error sending request: ' + error.message, 'error');
            }
          });
        }
      } else {
        this.setFeedbackMessage('No such Group exists.', 'error');
      }
    }
  }




  promoteMember(newMemberUsername: string, role: 'superAdmin' | 'groupAdmin') {
    this.clearFeedbackMessage();
    if (this.selectedGroupId !== null && newMemberUsername.trim() !== '') {
      const requestData = {
        username: newMemberUsername.trim(),
        role: role
      };

      console.log('Promoting member with data:', requestData);

      this.http.post<{ message: string }>('http://localhost:3000/manageGroup/promote', requestData).subscribe({
        next: (response) => {
          this.setFeedbackMessage(response.message, 'success');
          this.loadGroups();
        },
        error: (error) => {
          this.setFeedbackMessage('Error promoting user: ' + (error.error.message || error.message), 'error');
        }
      });
    } else {
      this.setFeedbackMessage('No group selected or username is empty.', 'error');
    }
  }



  loadRequests() {
    if (this.selectedGroupId !== null) {
      this.http.get<{ username: string; reason: string; groupId: number }[]>(`http://localhost:3000/manageRequests/${this.selectedGroupId}`)
        .subscribe({
          next: (data) => {
            this.requests = data;
          },
          error: (error) => {
            console.error('Error loading requests:', error);
          }
        });
    }
  }

  approveRequest(username: string) {
    const requestData = {
      groupId: this.selectedGroupId,
      username: username,
    };
    console.log('Approving request for:', { username });
    this.http.post<{ message: string }>('http://localhost:3000/manageRequests/approve', requestData).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadRequests();
      },
      error: (error) => {
        alert('Error approving request: ' + error.message);
      }
    });
  }

  rejectRequest(username: string) {
    const requestData = {
      groupId: this.selectedGroupId,
      username: username,
    };

    this.http.post<{ message: string }>('http://localhost:3000/manageRequests/reject', requestData).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadRequests();
      },
      error: (error) => {
        alert('Error rejecting request: ' + error.message);
      }
    });
  }

  showViewRequestsModal(groupId: number) {
    this.selectedGroupId = groupId;
    this.showViewRequestsForm = true;
    this.joinRequestGroupName = this.groups.find(g => g.id === groupId)?.name || '';
    this.loadRequests();
  }
  hideViewRequestsForm() {
    this.showViewRequestsForm = false;
  }

  showJoinRequestModal() {
    this.showRequestForm = true;
  }
  hideJoinRequestForm() {
    this.showRequestForm = false;
  }

  showJoinRequests() {
    return this.requests.filter(request => request.reason === 'has requested to join the group');
  }

  showAdminRequests() {
    return this.requests.filter(request => request.reason === 'has requested admin rights for this group');
  }


  //Ban User from Channel
  banUserFromChannel() {
    if (this.selectedChannelId !== null && this.banUserName.trim() !== '') {
      const banData = {
        channelId: this.selectedChannelId,
        username: this.banUserName.trim(),
        reason: this.banReason
      };

      this.http.post<{ message: string }>('http://localhost:3000/manageChannel/ban', banData).subscribe({
        next: (response) => {
          this.setFeedbackMessage(response.message, 'success');
          this.banUserName = '';
          this.banReason = '';
          this.loadBannedUsers();
          this.loadChannels();
        },
        error: (error) => {
          this.setFeedbackMessage('Error banning user: ' + (error.error.message || error.message), 'error');
        }
      });
    } else {
      this.setFeedbackMessage('Channel or username cannot be empty.', 'error');
    }
  }



  //Load banned users from JSON
  loadBannedUsers() {
    this.http.get<{ channelId: number, username: string, reason: string }[]>('http://localhost:3000/manageChannel/bannedUsers')
      .subscribe({
        next: (data) => {
          this.bannedUsers = data;
          console.log('Loaded banned users:', this.bannedUsers);
        },
        error: (error) => {
          console.error('Error loading banned users:', error);
        }
      });
  }


  showBanUserModal() {
    this.banUserName = '';
    this.banReason = '';
    this.showBanUserForm = true;
  }

  hideBanUserModal() {
    this.showBanUserForm = false;
  }

  // Reports
  banReports() {
    const channelId = this.selectedChannelId;
    this.banReportsList = this.bannedUsers.filter(ban => ban.channelId === channelId);
  }

  showBanReportsModal() {
    this.banReports();
    this.showBanReportsForm = true;
  }

  hideBanReportsModal() {
    this.showBanReportsForm = false;
  }

  //Check Permissions
  //for admins overall
  isAdmin(): boolean {
    return this.loggedInUser?.roles?.includes('groupAdmin') || this.loggedInUser?.roles?.includes('superAdmin') || false;
  }

  //for group owner
  ownsGroup(groupId: number): boolean {
    const group = this.groups.find(group => group.id === groupId);
    if (group && (this.loggedInUser?.username === group.ownerName || this.loggedInUser?.roles?.includes('superAdmin')) || false) {
      return true;
    }
    return false;
  }

  //for all group administrators
  isGroupAdmin(groupId: number) {
    const group = this.groups.find(group => group.id === groupId);
    if (group && (group.admins?.includes(this.loggedInUser.username) || this.loggedInUser.username === group.ownerName || this.loggedInUser.roles?.includes('superAdmin'))) {
      return true;
    }
    return false;
  }

  //Feeback Message
  setFeedbackMessage(message: string, type: string) {
    this.feedbackMessage = message;
    this.feedbackMessageType = type;
    setTimeout(() => this.clearFeedbackMessage(), 1250);
  }

  clearFeedbackMessage() {
    this.feedbackMessage = '';
    this.feedbackMessageType = '';
  }

  showManageMembersModal() {
    this.showManageMembersForm = true;
  }

  hideManageMembersModal() {
    this.showManageMembersForm = false;
  }

  getSelectedGroupName(): string {
    const group = this.groups.find(g => g.id === this.selectedGroupId);
    return group ? group.name : '';
  }

  getSelectedGroupMembers(): number[] {
    const group = this.groups.find(g => g.id === this.selectedGroupId);
    return group ? group.members : [];
  }

  getUsernameById(userId: number): string {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.id === userId);
    return user ? user.username : 'Unknown User';
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}
