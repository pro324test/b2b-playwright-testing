import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(userId: number, createChatDto: CreateChatDto) {
    // Check if recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: createChatDto.recipientId }
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Check if chat already exists
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        OR: [
          {
            AND: [
              { user1Id: userId },
              { user2Id: createChatDto.recipientId }
            ]
          },
          {
            AND: [
              { user1Id: createChatDto.recipientId },
              { user2Id: userId }
            ]
          }
        ]
      }
    });

    if (existingChat) {
      return existingChat;
    }

    return this.prisma.chat.create({
      data: {
        user1Id: userId,
        user2Id: createChatDto.recipientId,
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    });
  }

  async sendMessage(chatId: number, userId: number, sendMessageDto: SendMessageDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // If chat was archived by this user, unarchive it
    if (chat.user1Id === userId && chat.isArchived1) {
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived1: false }
      });
    } else if (chat.user2Id === userId && chat.isArchived2) {
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived2: false }
      });
    }

    return this.prisma.message.create({
      data: {
        content: sendMessageDto.content,
        mediaUrl: sendMessageDto.mediaUrl,
        chatId,
        senderId: userId,
        isRead: false
      },
      include: {
        sender: true
      }
    });
  }

  async getUserChats(userId: number) {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { 
            user1Id: userId,
            isArchived1: false // Only return non-archived chats
          },
          { 
            user2Id: userId,
            isArchived2: false // Only return non-archived chats
          }
        ]
      },
      include: {
        user1: true,
        user2: true,
        messages: {
          where: { isDeleted: false }, // Only return non-deleted messages
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async getChatMessages(chatId: number, userId: number, options?: GetMessagesDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Check if user has archived this chat
    const hasArchived = chat.user1Id === userId ? chat.isArchived1 : chat.isArchived2;
    if (hasArchived) {
      throw new BadRequestException('You have archived this chat');
    }

    // Set up filters and pagination
    const where: any = { 
      chatId,
      isDeleted: false // Only return non-deleted messages
    };
    
    if (options?.before) {
      where.createdAt = { lt: new Date(options.before) };
    }

    const limit = options?.limit || 20;

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Mark unread messages as read if user is not the sender
    await this.markMessagesAsRead(chatId, userId);

    return messages;
  }

  async getChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: true,
        user2: true,
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { sender: true }
        }
      }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Check if user has archived this chat
    const hasArchived = chat.user1Id === userId ? chat.isArchived1 : chat.isArchived2;
    if (hasArchived) {
      throw new BadRequestException('You have archived this chat');
    }

    // Mark unread messages as read if user is not the sender
    await this.markMessagesAsRead(chatId, userId);

    return chat;
  }

  async markMessagesAsRead(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Mark all messages from the other user as read
    return this.prisma.message.updateMany({
      where: {
        chatId,
        senderId: {
          not: userId // Only mark messages not sent by this user
        },
        isRead: false // Only update unread messages
      },
      data: {
        isRead: true
      }
    });
  }

  async markMessageAsRead(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is part of the chat
    if (message.chat.user1Id !== userId && message.chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Only mark as read if the user is not the sender
    if (message.senderId === userId) {
      throw new BadRequestException('You cannot mark your own messages as read');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: { sender: true }
    });
  }

  async editMessage(messageId: number, userId: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if message is deleted
    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted message');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: updateMessageDto.content,
        mediaUrl: updateMessageDto.mediaUrl,
        updatedAt: new Date()
      },
      include: { sender: true }
    });
  }

  async deleteMessage(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the sender or a chat participant
    if (message.senderId !== userId && 
        message.chat.user1Id !== userId && 
        message.chat.user2Id !== userId) {
      throw new ForbiddenException('You cannot delete this message');
    }

    // Soft delete the message
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: message.senderId === userId ? 
          'This message was deleted by the sender' : 
          'This message was deleted by a chat participant'
      }
    });
  }

  async archiveChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Archive for the correct user
    if (chat.user1Id === userId) {
      return this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived1: true }
      });
    } else {
      return this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived2: true }
      });
    }
  }

  async unarchiveChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Unarchive for the correct user
    if (chat.user1Id === userId) {
      return this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived1: false }
      });
    } else {
      return this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived2: false }
      });
    }
  }

  async deleteChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('You are not a participant in this chat');
    }

    // Instead of actually deleting, we'll mark all user's messages as deleted
    // and archive the chat for that user
    if (chat.user1Id === userId) {
      await this.prisma.message.updateMany({
        where: { chatId, senderId: userId },
        data: { isDeleted: true }
      });
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived1: true }
      });
    } else {
      await this.prisma.message.updateMany({
        where: { chatId, senderId: userId },
        data: { isDeleted: true }
      });
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { isArchived2: true }
      });
    }

    return { message: 'Chat deleted successfully' };
  }
}