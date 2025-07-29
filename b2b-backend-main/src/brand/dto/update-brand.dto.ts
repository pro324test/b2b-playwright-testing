import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @ApiPropertyOptional({ example: 'Updated Nike' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated sports and lifestyle brand description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://updated-website.com' })
  @IsString()
  @IsOptional()
  website?: string;

  // This field will be used to indicate if the logo should be removed
  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  removeLogo?: boolean;
}