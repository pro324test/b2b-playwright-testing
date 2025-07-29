// review-settings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReviewSettingsDto } from './dto/review-settings.dto';

@Injectable()
export class ReviewSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // Get the review settings
    const settings = await this.prisma.reviewSettings.findFirst();
    
    // If no settings exist, create default settings
    if (!settings) {
      return this.createDefaultSettings();
    }
    
    return settings;
  }

  async updateSettings(updateDto: UpdateReviewSettingsDto) {
    const settings = await this.prisma.reviewSettings.findFirst();
    
    // If no settings exist, create them with the provided updates
    if (!settings) {
      return this.prisma.reviewSettings.create({
        data: {
          ...this.getDefaultSettings(),
          ...updateDto,
        },
      });
    }
    
    // Otherwise, update existing settings
    return this.prisma.reviewSettings.update({
      where: { id: settings.id },
      data: updateDto,
    });
  }

  private async createDefaultSettings() {
    const defaultSettings = this.getDefaultSettings();
    
    return this.prisma.reviewSettings.create({
      data: defaultSettings,
    });
  }

  private getDefaultSettings() {
    return {
      // Match exactly the fields in the Prisma schema
      requirePurchaseVerification: false,
      showVerificationBadge: true,      // Changed from showVerifiedBadge
      requireRating: true,
      requireText: false,
      moderationEnabled: false,
      maxImagesPerReview: 3,
      defaultStatus: "approved",
      autoApproveVerifiedOnly: false,
      moderateNegativeOnly: false,
      negativeBelowRating: 2,
      mediaEnabled: true
      // Removed: displayName, allowHelpfulVoting, allowReplies, allowVendorReplies, emailNotifications
    };
  }
}