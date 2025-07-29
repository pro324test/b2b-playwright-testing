import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SendSmsOptions, SmsResponse, SmsType, SmsTemplate } from './interfaces/sms.interface';
import { SmsMessages } from './sms-messages.constants';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiToken: string;
  private readonly senderId: string;
  private readonly defaultType: SmsType;
  private readonly apiUrl: string;
  private readonly countryCode: string = '218'; // Default country code for Libya

  constructor(private configService: ConfigService) {
    this.apiToken = this.configService.get<string>('SMS_API_TOKEN') || '101|legAFVE0MdYdtbessdLTEz8wUIDx80MLeV0J3NwM';
    this.senderId = this.configService.get<string>('SMS_SENDER_ID') || 'Becom-Ftech';
    this.defaultType = (this.configService.get<string>('SMS_TYPE') as SmsType) || SmsType.UNICODE;
    this.apiUrl = this.configService.get<string>('SMS_URL') || 'https://isend.com.ly/api/http/sms/send';

    // Log configuration for debugging
    this.logger.log(`SMS Service initialized with URL: ${this.apiUrl}`);
    this.logger.log(`Sender ID: ${this.senderId}`);
    
    if (!this.apiToken || !this.senderId || !this.apiUrl) {
      this.logger.error('SMS settings are not properly configured!');
    }
  }

  /**
   * Format phone number for SMS API
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces or special characters
    phoneNumber = phoneNumber.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    // Remove leading zero if present
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }
    
    // Add country code if missing
    if (!phoneNumber.startsWith(this.countryCode)) {
      phoneNumber = this.countryCode + phoneNumber;
    }
    
    return phoneNumber;
  }

  /**
   * Send SMS to a single recipient or multiple recipients
   */
  async sendSms(options: SendSmsOptions): Promise<SmsResponse> {
    try {
      const { recipient, message, senderId, type, scheduleTime, dltTemplateId } = options;

      // Format recipient(s) for API
      let formattedRecipient: string;
      
      if (Array.isArray(recipient)) {
        // Format each phone number in the array
        formattedRecipient = recipient
          .map(number => this.formatPhoneNumber(number))
          .join(',');
      } else {
        // Format single phone number
        formattedRecipient = this.formatPhoneNumber(recipient);
      }

      const payload = {
        api_token: this.apiToken,
        recipient: formattedRecipient,
        sender_id: senderId || this.senderId,
        type: type || this.defaultType,
        message,
        ...(scheduleTime && { schedule_time: scheduleTime.toISOString().slice(0, 16).replace('T', ' ') }),
        ...(dltTemplateId && { dlt_template_id: dltTemplateId })
      };

      // Log the request (without sensitive information)
      const logPayload = { 
        ...payload, 
        api_token: '[HIDDEN]',
        recipient: formattedRecipient // Log the formatted number for debugging
      };
      this.logger.log(`Sending SMS: ${JSON.stringify(logPayload)}`);

      // Use this for development to avoid sending real SMS
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`[DEV MODE] SMS content: ${message}`);
        return {
          success: true,
          data: { dev_mode: true },
          messageId: 'dev-mode',
          statusCode: 200,
          status: 'success'
        };
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the response (success case)
      this.logger.log(`SMS sent successfully: ${JSON.stringify(response.data)}`);

      return {
        success: true,
        data: response.data,
        messageId: response.data?.id || response.data?.message_id,
        statusCode: response.status,
        status: 'success'
      };
    } catch (error) {
      // Log the error
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);

      return {
        success: false,
        message: `Failed to send SMS: ${error.message}`,
        statusCode: error.response?.status || 500,
        status: 'error'
      };
    }
  }

  /**
   * Helper method to generate OTP
   */
  generateOTP(length = 6): string {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  /**
   * Send OTP SMS with language support
   */
  async sendOTP(phoneNumber: string, otp?: string, lang: string = 'ar'): Promise<SmsResponse> {
    const generatedOTP = otp || this.generateOTP();
    
    return this.sendTemplatedSms(
      phoneNumber,
      SmsTemplate.OTP,
      { otp: generatedOTP },
      lang
    );
  }

  /**
   * Method to use templates for different SMS types with language support
   */
  async sendTemplatedSms(
    recipient: string | string[], 
    template: SmsTemplate, 
    params: Record<string, string>,
    lang: string = 'ar'
  ): Promise<SmsResponse> {
    const templateMessage = this.getTemplateMessage(template, params, lang);
    
    return this.sendSms({
      recipient,
      message: templateMessage,
      type: SmsType.UNICODE // Using UNICODE for Arabic text
    });
  }

  /**
   * Generate message from template with language support
   */
  private getTemplateMessage(
    template: SmsTemplate, 
    params: Record<string, string>,
    lang: string = 'ar'
  ): string {
    // Use 'ar' as fallback if language not supported
    const language = ['ar', 'en'].includes(lang) ? lang : 'ar';
    
    // Get template text based on template type and language
    let templateText = '';
    switch (template) {
      case SmsTemplate.OTP:
        templateText = SmsMessages.TEMPLATES.OTP[language];
        break;
      case SmsTemplate.WELCOME:
        templateText = SmsMessages.TEMPLATES.WELCOME[language];
        break;
      case SmsTemplate.ORDER_CONFIRMATION:
        templateText = SmsMessages.TEMPLATES.ORDER_CONFIRMATION[language];
        break;
      case SmsTemplate.PASSWORD_RESET:
        templateText = SmsMessages.TEMPLATES.PASSWORD_RESET[language];
        break;
      case SmsTemplate.ACCOUNT_UPDATE:
        templateText = SmsMessages.TEMPLATES.ACCOUNT_UPDATE[language];
        break;
      case SmsTemplate.PAYMENT_CONFIRMATION:
        templateText = SmsMessages.TEMPLATES.PAYMENT_CONFIRMATION[language];
        break;
      case SmsTemplate.DELIVERY_UPDATE:
        templateText = SmsMessages.TEMPLATES.DELIVERY_UPDATE[language];
        break;
      default:
        // If no template found, return empty string
        return '';
    }
    
    // Replace template parameters with actual values
    return this.replaceTemplateParams(templateText, params);
  }
  
  /**
   * Replace template parameters in the message
   */
  private replaceTemplateParams(template: string, params: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return result;
  }
}