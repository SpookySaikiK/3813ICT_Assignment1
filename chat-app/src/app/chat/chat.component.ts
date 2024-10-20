import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

  messages: { channelId: number, username: string, text: string, timestamp: string }[] = [];
  filteredMessages: { channelId: number, username: string, text: string, timestamp: string }[] = [];
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

  constructor(private router: Router, private http: HttpClient) { };

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


  loadMessages() {
    if (this.selectedChannelId !== null) {
      this.http.get<{ channelId: number, username: string, text: string, timestamp: string }[]>(`http://localhost:3000/manageMessages/${this.selectedChannelId}`)
        .subscribe({
          next: (data) => {
            this.filteredMessages = data;
            console.log('Loaded messages:', this.filteredMessages);
          },
          error: (error) => {
            console.error('Error loading messages:', error);
          }
        });
    }
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
    this.selectedGroupId = groupId;
    this.selectedChannelId = null;
    this.loadChannels();
  }


  selectChannel(channelId: number) {
    this.selectedChannelId = channelId;
    this.loadMessages();
  }

  sendMessage() {
    if (this.selectedChannelId !== null && this.newMessage.trim() !== '') {
      const messageData = {
        channelId: this.selectedChannelId,
        username: this.loggedInUser.username,
        text: this.newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      this.http.post<{ message: string, sentMessage: any }>('http://localhost:3000/manageMessages/send', messageData).subscribe({
        next: (response) => {
          this.setFeedbackMessage(response.message, 'success');
          this.newMessage = '';
          this.loadMessages();
        },
        error: (error) => {
          this.setFeedbackMessage('Error sending message: ' + error.message, 'error');
        }
      });
    } else {
      this.setFeedbackMessage('Message cannot be empty.', 'error');
    }
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

      this.http.post<{ message: string }>('http://localhost:3000/manageChannel/create', channelData).subscribe({
        next: (response) => {
          alert(response.message);
          this.newChannelName = '';
          this.loadChannels(); //Reload channels after creation
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
