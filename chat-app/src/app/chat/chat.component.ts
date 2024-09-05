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
  groups: { id: number, name: string, adminId: number }[] = [];
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







  constructor(private router: Router) { };

  ngOnInit(): void {

    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      if (user) {
        this.loggedInUser = JSON.parse(user);

      } else {
        this.loggedInUser = {};
        this.router.navigateByUrl('/login');
      }
    }

    const groups = [
      { id: 1, name: 'Group 1' },
      { id: 2, name: 'Group 2' }
    ];

    const channels = [
      { id: 1, name: 'Channel 1', groupId: 1 },
      { id: 2, name: 'Channel 2', groupId: 1 },
      { id: 3, name: 'Channel 3', groupId: 2 }
    ];

    if (typeof window !== 'undefined') {
      localStorage.setItem('groups', JSON.stringify(groups));
      localStorage.setItem('channels', JSON.stringify(channels));

      this.loadGroups();
      this.loadChannels();
      this.loadMessages();
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
    if (this.newGroupName.trim() !== '') {
      const newGroup = {
        id: this.groups.length + 1,
        name: this.newGroupName.trim(),
        adminId: this.loggedInUser.id
      };

      this.groups.push(newGroup);
      localStorage.setItem('groups', JSON.stringify(this.groups));
      this.newGroupName = '';
      this.hideCreateGroupForm();

    }

  }

  deleteGroup(groupId: number) {

  }

  createChannel() {
    if (this.selectedGroupId !== null && this.newChannelName.trim() !== '') {
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

  }

  showCreateGroupForm(){
    this.showGroupForm = true;
  }

  hideCreateGroupForm() {
    this.showGroupForm = false;
  }

  showCreateChannelForm(){
    this.showChannelForm = true;
  }

  hideCreateChannelForm() {
    this.showChannelForm = false;
  }














  scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }









}
