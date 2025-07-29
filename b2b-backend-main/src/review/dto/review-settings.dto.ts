// review-settings.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, IsOptional, Min, Max, IsIn } from 'class-validator';

export class UpdateReviewSettingsDto {
  @ApiProperty({ example: false, description: 'Require verified purchase to leave a review' })
  @IsOptional()
  @IsBoolean()
  requirePurchaseVerification?: boolean;

  @ApiProperty({ example: true, description: 'Show verified purchase badge on reviews' })
  @IsOptional()
  @IsBoolean()
  showVerificationBadge?: boolean;

  @ApiProperty({ example: true, description: 'Require a rating with reviews' })
  @IsOptional()
  @IsBoolean()
  requireRating?: boolean;

  @ApiProperty({ example: false, description: 'Require text content with reviews' })
  @IsOptional()
  @IsBoolean()
  requireText?: boolean;

  @ApiProperty({ example: false, description: 'Enable moderation for reviews' })
  @IsOptional()
  @IsBoolean()
  moderationEnabled?: boolean;

  @ApiProperty({ example: 3, description: 'Maximum number of images allowed per review' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  maxImagesPerReview?: number;

  @ApiProperty({ example: 'approved', enum: ['pending', 'approved'], description: 'Default status for new reviews' })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved'])
  defaultStatus?: string;

  @ApiProperty({ example: false, description: 'Only auto-approve reviews from verified purchases' })
  @IsOptional()
  @IsBoolean()
  autoApproveVerifiedOnly?: boolean;

  @ApiProperty({ example: false, description: 'Only moderate negative reviews' })
  @IsOptional()
  @IsBoolean()
  moderateNegativeOnly?: boolean;

  @ApiProperty({ example: 2, description: 'Ratings below this are considered negative' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  negativeBelowRating?: number;

  @ApiProperty({ example: true, description: 'Allow media uploads with reviews' })
  @IsOptional()
  @IsBoolean()
  mediaEnabled?: boolean;
}