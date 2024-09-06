import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  groups: { id: number, name: string, adminId: number, members: number[] }[] = [];
  channels: { id: number, name: string, groupId: number }[] = [];
  messages: { channelId: number, username: string, text: string }[] = [];
  newMessage: string = '';
  newGroupName: string = '';
  newChannelName: string = '';

  selectedGroupId: number | null = null;
  selectedChannelId: number | null = null;

  filteredChannels: { id: number, name: string, groupId: number }[] = [];
  filteredMessages: { channelId: number, username: string, text: string }[] = [];

  loggedInUser: any;
  showGroupForm: boolean = false;
  showChannelForm: boolean = false;

  showManageMembersForm: boolean = false;
  newMemberUsername: string = '';
  selectedMemberToRemove: number | null = null;

  feedbackMessage: string = '';
  feedbackMessageType: string = '';

  removeMemberUsername: string = '';

  constructor(private router: Router) { };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.loggedInUser = JSON.parse(user);
        this.loadGroups();
        this.loadChannels();
        this.loadMessages();
        this.filterUserGroups()
      } else {
        this.loggedInUser = {};
        this.router.navigateByUrl('/login');
      }
    }
  }

  loadGroups() {
    this.groups = JSON.parse(localStorage.getItem('groups') || '[]')
  }

  loadChannels() {
    this.channels = JSON.parse(localStorage.getItem('channels') || '[]')

  }

  loadMessages() {
    this.messages = JSON.parse(localStorage.getItem('messages') || '[]')

  }

  filterUserGroups() {
    this.groups = this.groups.filter(group =>
      group.members.includes(this.loggedInUser.id) || this.loggedInUser.roles.includes('superAdmin')
    );
  }

  selectGroup(groupId: number) {
    this.selectedGroupId = groupId;
    this.selectedChannelId = null;
    this.filteredChannels = this.channels.filter(channel => channel.groupId === groupId);
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

  createGroup() {
    if (this.newGroupName.trim() !== '' && this.isAdmin()) {
      const newGroup = {
        id: this.groups.length + 1,
        name: this.newGroupName.trim(),
        adminId: this.loggedInUser.id,
        members: [this.loggedInUser.id]
      };

      this.groups.push(newGroup);
      localStorage.setItem('groups', JSON.stringify(this.groups));
      this.newGroupName = '';
      this.hideCreateGroupForm();
    }
  }

  deleteGroup(groupId: number) {
    if (this.isAdmin()) {
      this.groups = this.groups.filter(group => group.id !== groupId);
      localStorage.setItem('groups', JSON.stringify(this.groups));
      this.channels = this.channels.filter(channel => channel.groupId !== groupId);
      localStorage.setItem('channels', JSON.stringify(this.channels));
      this.messages = this.messages.filter(message => !this.channels.some(channel => channel.id === message.channelId && channel.groupId === groupId));
      localStorage.setItem('messages', JSON.stringify(this.messages));

      if (this.selectedGroupId === groupId) {
        this.selectedGroupId = null;
        this.selectedChannelId = null;
        this.filteredChannels = [];
        this.filteredMessages = [];
      }
    }
  }


  createChannel() {
    if (this.selectedGroupId !== null && this.newChannelName.trim() !== '' && this.isAdmin()) {
      const newChannel = {
        id: this.channels.length + 1,
        name: this.newChannelName.trim(),
        groupId: this.selectedGroupId
      };
      this.channels.push(newChannel);
      this.filteredChannels.push(newChannel);
      localStorage.setItem('channels', JSON.stringify(this.channels));
      this.newChannelName = '';
      this.hideCreateChannelForm();
    }
  }

  deleteChannel(channelId: number) {
    if (this.isAdmin()) {
      this.channels = this.channels.filter(channel => channel.id !== channelId);
      localStorage.setItem('channels', JSON.stringify(this.channels));
      this.messages = this.messages.filter(message => message.channelId !== channelId);
      localStorage.setItem('messages', JSON.stringify(this.messages));

      if (this.selectedChannelId === channelId) {
        this.selectedChannelId = null;
        this.filteredMessages = [];
      }
      if (this.selectedGroupId !== null) {
        this.filteredChannels = this.channels.filter(channel => channel.groupId === this.selectedGroupId);
      }
    }
  }

  addMember() {
    this.clearFeedbackMessage();
    if (this.selectedGroupId !== null && this.newMemberUsername.trim() !== '') {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.username === this.newMemberUsername);
      if (user) {
        const group = this.groups.find(g => g.id === this.selectedGroupId);
        if (group && !group.members.includes(user.id)) {
          group.members.push(user.id);
          localStorage.setItem('groups', JSON.stringify(this.groups));
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
        const group = this.groups.find(g => g.id === this.selectedGroupId);
        if (group && group.members.includes(user.id)) {
          group.members = group.members.filter(memberId => memberId !== user.id);
          localStorage.setItem('groups', JSON.stringify(this.groups));
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

  private setFeedbackMessage(message: string, type: string) {
    this.feedbackMessage = message;
    this.feedbackMessageType = type;
    setTimeout(() => this.clearFeedbackMessage(), 5000);
  }

  private clearFeedbackMessage() {
    this.feedbackMessage = '';
    this.feedbackMessageType = '';
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

  isAdmin(): boolean {
    return this.loggedInUser?.roles?.includes('groupAdmin') || this.loggedInUser?.roles?.includes('superAdmin') || false;
  }

  showCreateGroupForm() {
    this.showGroupForm = true;
  }

  hideCreateGroupForm() {
    this.showGroupForm = false;
  }

  showCreateChannelForm() {
    this.showChannelForm = true;
  }

  hideCreateChannelForm() {
    this.showChannelForm = false;
  }

  showManageMembersModal() {
    this.showManageMembersForm = true;
  }

  hideManageMembersModal() {
    this.showManageMembersForm = false;
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}
