import { ApiProperty } from '@nestjs/swagger';

export class CheckVendorRequestResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the user has submitted a vendor request'
  })
  hasRequest: boolean;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'accept', 'reject'],
    description: 'The status of the vendor request if it exists',
    nullable: true
  })
  status: string | null;

  @ApiProperty({
    example: '2025-03-05T10:30:00Z',
    description: 'When the request was submitted',
    nullable: true
  })
  createdAt: Date | null;

  @ApiProperty({
    example: 'I would like to become a vendor to sell electronics.',
    description: 'The message submitted with the vendor request',
    nullable: true
  })
  message: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID of the requested vendor group, if any',
    nullable: true
  })
  requestedGroupId: number | null;

  @ApiProperty({
    example: 'Tech Solutions LLC',
    description: 'Business name of the vendor',
    nullable: true
  })
  businessName: string | null;

  @ApiProperty({
    example: 'https://storage.example.com/documents/permit-123.pdf',
    description: 'URL to the practice permit document',
    nullable: true
  })
  practicePermitDoc: string | null;

  @ApiProperty({
    example: 'https://storage.example.com/documents/license-456.pdf',
    description: 'URL to the business license document',
    nullable: true
  })
  licenseDoc: string | null;
}