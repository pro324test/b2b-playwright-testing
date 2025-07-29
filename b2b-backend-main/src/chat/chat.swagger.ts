import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

export const CreateChatSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Create a new chat',
      description: 'Create a new chat conversation with another user. Messages will be delivered in real-time via WebSocket.'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 201, description: 'Chat created successfully' }),
    ApiResponse({ status: 404, description: 'Recipient not found' })
  );
};

export const SendMessageSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Send a message in a chat',
      description: 'Send a new message in an existing chat. The message will be delivered in real-time via WebSocket.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat to send message to',
      type: 'number'
    }),
    ApiBody({
      type: SendMessageDto,
      examples: {
        'Text message': {
          value: {
            content: 'Hello, how are you today?'
          }
        },
        'Message with media': {
          value: {
            content: 'Check out this image',
            mediaUrl: 'https://example.com/image.jpg'
          }
        }
      }
    }),
    ApiResponse({ status: 201, description: 'Message sent successfully' }),
    ApiResponse({ status: 404, description: 'Chat not found' }),
    ApiResponse({ status: 400, description: 'Not a chat participant' })
  );
};

export const GetUserChatsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Get all user chats',
      description: 'Get all chat conversations for the authenticated user. Real-time updates will be delivered via WebSocket.'
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'User chats retrieved successfully' })
  );
};

export const GetChatSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Get chat details',
      description: 'Get details about a specific chat conversation'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat to retrieve',
      type: 'number'
    }),
    ApiResponse({ status: 200, description: 'Chat details retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Chat not found' }),
    ApiResponse({ status: 403, description: 'Not a chat participant' })
  );
};

export const GetChatMessagesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Get messages from a specific chat',
      description: 'Get messages from a specific chat with pagination support. New messages will be delivered in real-time via WebSocket.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat to retrieve messages from',
      type: 'number'
    }),
    ApiQuery({
      name: 'before',
      required: false,
      type: String,
      description: 'Get messages before this timestamp (ISO format)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of messages to return (default: 20)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Chat messages retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 123 },
            content: { type: 'string', example: 'Hello, how are you?' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-02-27T15:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-02-27T15:30:00Z' },
            isRead: { type: 'boolean', example: false },
            readAt: { type: 'string', format: 'date-time', example: null, nullable: true },
            senderId: { type: 'number', example: 42 },
            chatId: { type: 'number', example: 15 },
            sender: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 42 },
                username: { type: 'string', example: 'john_doe' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Chat not found' }),
    ApiResponse({ status: 400, description: 'Not a chat participant' })
  );
};

export const MarkMessageAsReadSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Mark message as read',
      description: 'Mark a message as read. The sender will be notified via WebSocket.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat',
      type: 'number'
    }),
    ApiParam({
      name: 'messageId',
      description: 'ID of the message to mark as read',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Message marked as read',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 123 },
          isRead: { type: 'boolean', example: true },
          readAt: { type: 'string', format: 'date-time', example: '2025-02-27T15:35:20Z' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Message not found' }),
    ApiResponse({ status: 403, description: 'Not a chat participant' })
  );
};

export const DeleteMessageSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Delete message',
      description: 'Delete a message from a chat. Only the sender can delete their own messages.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat',
      type: 'number'
    }),
    ApiParam({
      name: 'messageId',
      description: 'ID of the message to delete',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Message deleted successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Message deleted successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Message not found' }),
    ApiResponse({ status: 403, description: 'Not the sender of this message' })
  );
};

export const EditMessageSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Edit message',
      description: 'Edit message content. Only the sender can edit their own messages.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat',
      type: 'number'
    }),
    ApiParam({
      name: 'messageId',
      description: 'ID of the message to edit',
      type: 'number'
    }),
    ApiBody({
      type: UpdateMessageDto,
      description: 'Updated message content',
      examples: {
        'Edit message': {
          value: {
            content: 'This is the updated message text'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Message edited successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 123 },
          content: { type: 'string', example: 'This is the updated message text' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-02-27T15:30:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-02-27T15:40:25Z' },
          isEdited: { type: 'boolean', example: true }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Message not found' }),
    ApiResponse({ status: 403, description: 'Not the sender of this message' })
  );
};

export const ArchiveChatSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Archive chat',
      description: 'Archive a chat to hide it from the main chat list'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat to archive',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Chat archived successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Chat archived successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Chat not found' }),
    ApiResponse({ status: 403, description: 'Not a chat participant' })
  );
};

export const UnarchiveChatSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Unarchive chat',
      description: 'Restore an archived chat to the main chat list'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat to unarchive',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Chat unarchived successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Chat unarchived successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Chat not found' }),
    ApiResponse({ status: 403, description: 'Not a chat participant' })
  );
};

export const DeleteChatSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Delete chat',
      description: 'Delete a chat conversation and all its messages'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'chatId',
      description: 'ID of the chat to delete',
      type: 'number'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Chat deleted successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Chat deleted successfully' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Chat not found' }),
    ApiResponse({ status: 403, description: 'Not a chat participant' })
  );
};

export const WebSocketEventsSwagger = {
  sendMessage: {
    event: 'sendMessage',
    payload: {
      chatId: 'number',
      message: {
        content: 'string'
      }
    },
    response: {
      id: 'number',
      content: 'string',
      senderId: 'number',
      chatId: 'number',
      createdAt: 'Date'
    }
  },
  typing: {
    event: 'typing',
    payload: {
      chatId: 'number',
      isTyping: 'boolean'
    }
  },
  userOnline: {
    event: 'userOnline',
    payload: {
      userId: 'number'
    }
  },
  userOffline: {
    event: 'userOffline',
    payload: {
      userId: 'number'
    }
  },
  newMessage: {
    event: 'newMessage',
    payload: {
      id: 'number',
      content: 'string',
      senderId: 'number',
      chatId: 'number',
      createdAt: 'Date'
    }
  },
  userTyping: {
    event: 'userTyping',
    payload: {
      chatId: 'number',
      userId: 'number',
      isTyping: 'boolean'
    }
  },
  markAsRead: {
    event: 'markAsRead',
    payload: {
      messageId: 'number'
    },
    response: {
      id: 'number',
      isRead: 'boolean',
      readAt: 'Date'
    }
  },
  messageRead: {
    event: 'messageRead',
    payload: {
      messageId: 'number',
      chatId: 'number',
      readBy: 'number'
    }
  },
  editMessage: {
    event: 'editMessage',
    payload: {
      messageId: 'number',
      update: {
        content: 'string'
      }
    },
    response: {
      id: 'number',
      content: 'string',
      isEdited: 'boolean',
      updatedAt: 'Date'
    }
  },
  messageEdited: {
    event: 'messageEdited',
    payload: {
      id: 'number',
      content: 'string',
      isEdited: 'boolean',
      updatedAt: 'Date',
      chatId: 'number'
    }
  },
  deleteMessage: {
    event: 'deleteMessage',
    payload: {
      messageId: 'number'
    }
  },
  messageDeleted: {
    event: 'messageDeleted',
    payload: {
      messageId: 'number',
      chatId: 'number'
    }
  }
};