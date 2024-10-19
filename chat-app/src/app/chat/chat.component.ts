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
  channels: { id: number, name: string, groupId: number }[] = [];
  messages: { channelId: number, username: string, text: string }[] = [];
  newMessage: string = '';
  newGroupName: string = '';
  newChannelName: string = '';

  selectedGroupId: number | null = null;
  selectedChannelId: number | null = null;

  filteredChannels: { id: number, name: string, groupId: number }[] = [];
  filteredMessages: { channelId: number, username: string, text: string }[] = [];

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
            this.filteredChannels = this.channels; //Update filtered channels to display
          },
          error: (error) => {
            console.error('Error loading channels:', error);
          }
        });
    }
  }


  loadMessages() {
    this.messages = JSON.parse(localStorage.getItem('messages') || '[]')

  }

  loadGroups() {
    this.http.get<{ id: number, name: string, ownerName: string, admins: number[], members: number[] }[]>('http://localhost:3000/manageGroup')
      .subscribe({
        next: (data) => {
          //Filter groups to only include those the user is a member of or if they are an admin
          this.groups = data.filter(group =>
            group.members.includes(this.loggedInUser.id) || group.admins.includes(this.loggedInUser.id)
          );
        },
        error: (error) => {
          console.error('Error loading groups:', error);
        }
      });
  }

  selectGroup(groupId: number) {
    this.selectedGroupId = groupId;
    this.selectedChannelId = null;

    const bannedChannelIds = this.bannedUsers
      .filter(ban => ban.username === this.loggedInUser.username)
      .map(ban => ban.channelId);

    this.filteredChannels = this.channels
      .filter(channel => channel.groupId === groupId && !bannedChannelIds.includes(channel.id));

    //Load channels when a group is selected
    this.loadChannels();
  }


  selectChannel(channelId: number) {
    this.selectedChannelId = channelId;
    this.filteredMessages = this.messages.filter(message => message.channelId === channelId);
  }

  sendMessage() {
    if (this.selectedChannelId !== null && this.newMessage.trim() !== '') {
      const newMsg = { channelId: this.selectedChannelId, username: this.loggedInUser.username, text: this.newMessage.trim() };
      this.messages.push(newMsg);
      this.filteredMessages.push(newMsg);
      this.newMessage = '';
      localStorage.setItem('messages', JSON.stringify(this.messages));
      setTimeout(() => this.scrollToBottom(), 0);
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
          this.loadGroups(); //Reload groups to show the newly created one
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
          alert('Error leaving group: ' + error.message); //Show error message
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
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === this.newMemberUsername);
      if (user) {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const group = groups.find((g: any) => g.id === this.selectedGroupId);
        if (group && !group.members.includes(user.id)) {
          group.members.push(user.id);
          localStorage.setItem('groups', JSON.stringify(groups));
          this.newMemberUsername = '';
          this.setFeedbackMessage('User added successfully!', 'success');
        } else {
          this.setFeedbackMessage('User is already a member of this group.', 'error');
        }
      } else {
        this.setFeedbackMessage('No such user exists.', 'error');
      }
    }
  }

  removeMember() {
    this.clearFeedbackMessage();
    if (this.selectedGroupId !== null && this.removeMemberUsername.trim() !== '') {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === this.removeMemberUsername);
      if (user) {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const group = groups.find((g: any) => g.id === this.selectedGroupId);
        if (group && group.members.includes(user.id)) {
          group.members = group.members.filter((memberId: number) => memberId !== user.id);
          localStorage.setItem('groups', JSON.stringify(groups));
          this.removeMemberUsername = '';
          this.setFeedbackMessage('User removed successfully!', 'success');
        } else {
          this.setFeedbackMessage('User is not a member of this group.', 'error');
        }
      } else {
        this.setFeedbackMessage('No such user exists.', 'error');
      }
    }
  }


  //Submit-View Join Request
  submitJoinRequest() {
    if (this.joinRequestGroupName.trim() !== '') {
      const allGroups = JSON.parse(localStorage.getItem('groups') || '[]');
      const group = allGroups.find((group: any) => group.name === this.joinRequestGroupName.trim());
      if (group) {
        const isMember = group.members.includes(this.loggedInUser.id);
        if (isMember) {
          this.setFeedbackMessage('You are already a member of this group.', 'error');
          return;
        }
        const existingRequest = this.requests.find(request =>
          request.username === this.loggedInUser.username &&
          request.groupId === group.id
        );
        if (existingRequest) {
          this.setFeedbackMessage('You already have a pending request for this group.', 'error');
        } else {
          const request = {
            username: this.loggedInUser.username,
            reason: 'has requested to join the group.',
            groupId: group.id
          };
          this.requests.push(request);
          localStorage.setItem('requests', JSON.stringify(this.requests));
          this.setFeedbackMessage('Request sent!', 'success');
        }
      } else {
        this.setFeedbackMessage('No such Group exists.', 'error');
      }
    }
  }

  requestAdminRights() {
    if (this.selectedGroupId !== null) {
      const group = this.groups.find(g => g.id === this.selectedGroupId);
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
        }
        else {
          const request = {
            username: this.loggedInUser.username,
            reason: 'has requested admin rights for this group.',
            groupId: this.selectedGroupId
          };
          this.requests.push(request);
          localStorage.setItem('requests', JSON.stringify(this.requests));
          this.setFeedbackMessage('Admin request sent!', 'success');
        }
      } else {
        this.setFeedbackMessage('No such Group exists.', 'error');
      }
      this.loadGroups();
    }
  }

  promoteMember(newMemberUsername: string, role: 'superAdmin' | 'groupAdmin') {
    this.clearFeedbackMessage();
    if (this.selectedGroupId !== null && newMemberUsername.trim() !== '') {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === newMemberUsername);
      if (user) {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const group = groups.find((g: any) => g.id === this.selectedGroupId);
        if (group) {
          if (role === 'groupAdmin') {
            if (!group.admins.includes(user.id)) {
              group.admins.push(user.id);
              this.setFeedbackMessage('User promoted to Group Admin successfully!', 'success');
            } else {
              this.setFeedbackMessage('User is already a Group Admin.', 'error');
            }
          } else if (role === 'superAdmin') {
            if (!user.roles.includes('superAdmin')) {
              user.roles.push('superAdmin');
              this.setFeedbackMessage('User promoted to Super Admin successfully!', 'success');
            } else {
              this.setFeedbackMessage('User is already a Super Admin.', 'error');
            }
          }
          localStorage.setItem('groups', JSON.stringify(groups));
          localStorage.setItem('users', JSON.stringify(users));
          this.requests = this.requests.filter(request => request.username !== user.username);
          localStorage.setItem('requests', JSON.stringify(this.requests));
        } else {
          this.setFeedbackMessage('No such group exists.', 'error');
        }
      } else {
        this.setFeedbackMessage('No such user exists.', 'error');
      }
    }
  }

  loadRequests() {
    const allRequests: { username: string; reason: string; groupId: number }[] = JSON.parse(localStorage.getItem('requests') || '[]');
    if (this.selectedGroupId !== null) {
      this.requests = allRequests.filter((request: { username: string; reason: string; groupId: number }) => request.groupId === this.selectedGroupId);
    } else {
      this.requests = allRequests;
    }
  }

  approveRequest(username: string) {
    if (this.selectedGroupId !== null) {
      const groups = JSON.parse(localStorage.getItem('groups') || '[]');
      const group = groups.find((g: any) => g.id === this.selectedGroupId);
      const user = JSON.parse(localStorage.getItem('users') || '[]').find((u: any) => u.username === username);
      if (group && user) {
        group.members.push(user.id);
        localStorage.setItem('groups', JSON.stringify(groups));
        this.requests = this.requests.filter(request => request.username !== username);
        localStorage.setItem('requests', JSON.stringify(this.requests));
        this.setFeedbackMessage('Request approved!', 'success');
      }
    }
  }

  rejectRequest(username: string) {
    if (this.selectedGroupId !== null) {
      this.requests = this.requests.filter(request => request.username !== username);
      localStorage.setItem('requests', JSON.stringify(this.requests));
      this.setFeedbackMessage('Request rejected.', 'error');
    }
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
    return this.requests.filter(request => request.reason === 'has requested to join the group.');
  }

  showAdminRequests() {
    return this.requests.filter(request => request.reason === 'has requested admin rights for this group.');
  }

  //Ban User
  banUserFromChannel() {
    const channel = this.channels.find(c => c.id === this.selectedChannelId);
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    const newBan = {
      channelId: this.selectedChannelId,
      username: this.banUserName,
      reason: this.banReason
    };
    bannedUsers.push(newBan);
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    this.setFeedbackMessage('User banned successfully!', 'success');
    this.hideBanUserModal();
  }

  loadBannedUsers() {
    this.bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
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
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    this.banReportsList = bannedUsers.filter((ban: any) => ban.channelId === this.selectedChannelId);
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
