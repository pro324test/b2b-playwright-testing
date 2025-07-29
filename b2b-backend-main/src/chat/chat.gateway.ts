import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../common/guards/ws-jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // Your frontend URL
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<number, string>(); // userId -> socketId

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      if (userId) {
        this.connectedClients.set(userId, client.id);
        client.join(`user_${userId}`); // Join personal room
        
        // Emit online status to relevant users
        const userChats = await this.chatService.getUserChats(userId);
        const connectedUsers = Array.from(this.connectedClients.keys());
        
        userChats.forEach(chat => {
          const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
          if (connectedUsers.includes(otherUserId)) {
            this.server.to(`user_${otherUserId}`).emit('userOnline', { userId });
          }
        });
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const entries = Array.from(this.connectedClients.entries());
    const disconnectedUser = entries.find(([_, socketId]) => socketId === client.id);
    
    if (disconnectedUser) {
      const [userId] = disconnectedUser;
      this.connectedClients.delete(userId);
      
      // Emit offline status to relevant users
      this.server.emit('userOffline', { userId });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: number; message: SendMessageDto }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      const message = await this.chatService.sendMessage(
        payload.chatId,
        userId,
        payload.message
      );

      const chat = await this.chatService.getChat(payload.chatId, userId);
      const recipientId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;

      // Emit message to recipient if online
      if (this.connectedClients.has(recipientId)) {
        this.server.to(`user_${recipientId}`).emit('newMessage', message);
      }

      return message;
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: number; isTyping: boolean }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      const chat = await this.chatService.getChat(payload.chatId, userId);
      
      if (chat.user1Id !== userId && chat.user2Id !== userId) {
        throw new WsException('Not a participant in this chat');
      }
  
      const recipientId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
  
      if (this.connectedClients.has(recipientId)) {
        this.server.to(`user_${recipientId}`).emit('userTyping', {
          chatId: payload.chatId,
          userId,
          isTyping: payload.isTyping
        });
      }
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  // New WebSocket events for enhanced chat functionality

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: number }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      const message = await this.chatService.markMessageAsRead(payload.messageId, userId);
      
      // Notify the sender that their message has been read
      if (this.connectedClients.has(message.senderId)) {
        this.server.to(`user_${message.senderId}`).emit('messageRead', {
          messageId: message.id,
          chatId: message.chatId,
          readBy: userId
        });
      }
      
      return message;
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: number; update: UpdateMessageDto }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      const message = await this.chatService.editMessage(
        payload.messageId, 
        userId, 
        payload.update
      );

      // Get the chat to identify the other participant
      const chat = await this.chatService.getChat(message.chatId, userId);
      const recipientId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;

      // Notify the other participant that a message has been edited
      if (this.connectedClients.has(recipientId)) {
        this.server.to(`user_${recipientId}`).emit('messageEdited', message);
      }

      return message;
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: number }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      const message = await this.chatService.deleteMessage(payload.messageId, userId);

      // Get the chat to identify the other participant
      const chat = await this.chatService.getChat(message.chatId, userId);
      const recipientId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;

      // Notify the other participant that a message has been deleted
      if (this.connectedClients.has(recipientId)) {
        this.server.to(`user_${recipientId}`).emit('messageDeleted', {
          messageId: message.id,
          chatId: message.chatId
        });
      }

      return message;
    } catch (error) {
      client.emit('error', error.message);
    }
  }
}