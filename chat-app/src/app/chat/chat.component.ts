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

  selectedGroupId: number | null = null;
  selectedChannelId: number | null = null;

  filteredChannels: { id: number, name: string, groupId: number }[] = [];
  filteredMessages: { channelId: number, username: string, text: string }[] = [];

  loggedInUser: any;

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

  scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }









}
