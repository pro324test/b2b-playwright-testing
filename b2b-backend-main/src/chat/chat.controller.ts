import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  UseGuards, 
  Req, 
  Query,
  Patch,
  Delete,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CreateChatSwagger,
  SendMessageSwagger,
  GetUserChatsSwagger,
  GetChatMessagesSwagger,
  GetChatSwagger,
  MarkMessageAsReadSwagger,
  DeleteMessageSwagger,
  EditMessageSwagger,
  ArchiveChatSwagger,
  UnarchiveChatSwagger,
  DeleteChatSwagger
} from './chat.swagger';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @CreateChatSwagger()
  async createChat(@Req() req, @Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(req.user.userId, createChatDto);
  }

  @Get()
  @GetUserChatsSwagger()
  async getUserChats(@Req() req) {
    return this.chatService.getUserChats(req.user.userId);
  }

  @Get(':chatId')
  @GetChatSwagger()
  async getChat(@Req() req, @Param('chatId', ParseIntPipe) chatId: number) {
    return this.chatService.getChat(chatId, req.user.userId);
  }

  @Get(':chatId/messages')
  @GetChatMessagesSwagger()
  async getChatMessages(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() getMessagesDto: GetMessagesDto
  ) {
    return this.chatService.getChatMessages(chatId, req.user.userId, getMessagesDto);
  }

  @Patch(':chatId/messages/:messageId/read')
  @MarkMessageAsReadSwagger()
  async markMessageAsRead(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number
  ) {
    return this.chatService.markMessageAsRead(messageId, req.user.userId);
  }

  @Patch(':chatId/messages/:messageId')
  @EditMessageSwagger()
  async editMessage(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    return this.chatService.editMessage(messageId, req.user.userId, updateMessageDto);
  }

  @Delete(':chatId/messages/:messageId')
  @DeleteMessageSwagger()
  async deleteMessage(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number
  ) {
    return this.chatService.deleteMessage(messageId, req.user.userId);
  }

  @Patch(':chatId/archive')
  @ArchiveChatSwagger()
  async archiveChat(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number
  ) {
    await this.chatService.archiveChat(chatId, req.user.userId);
    return { message: 'Chat archived successfully' };
  }

  @Patch(':chatId/unarchive')
  @UnarchiveChatSwagger()
  async unarchiveChat(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number
  ) {
    await this.chatService.unarchiveChat(chatId, req.user.userId);
    return { message: 'Chat unarchived successfully' };
  }

  @Delete(':chatId')
  @DeleteChatSwagger()
  async deleteChat(
    @Req() req, 
    @Param('chatId', ParseIntPipe) chatId: number
  ) {
    return this.chatService.deleteChat(chatId, req.user.userId);
  }
}