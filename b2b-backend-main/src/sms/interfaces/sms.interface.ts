export interface SendSmsOptions {
  recipient: string | string[];
  message: string;
  senderId?: string;
  type?: SmsType;
  scheduleTime?: Date;
  dltTemplateId?: string;
}

export interface SmsResponse {
  success: boolean;
  data?: any;
  message?: string;
  messageId?: string;
  statusCode: number;
  status: string;
}

export enum SmsType {
  TEXT = 'text',
  UNICODE = 'unicode',
  FLASH = 'flash',
  VOICE = 'voice'
}

export enum SmsTemplate {
  OTP = 'otp',
  WELCOME = 'welcome',
  ORDER_CONFIRMATION = 'order_confirmation',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_UPDATE = 'account_update',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  DELIVERY_UPDATE = 'delivery_update'
}