import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoamalatCredentialDto, UpdateMoamalatCredentialDto, MoamalatSystemSettingsDto } from './dto/moamalat-credential.dto';
import { createHmac } from 'crypto';

@Injectable()
export class MoamalatService {
  constructor(private prisma: PrismaService) {}

  // Get credentials for payment processing (vendor-specific or system default)
  async getMoamalatCredentials(shopId: number) {
    // Find the shop and associated vendor
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: { vendor: true },
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    // Check if vendor has active Moamalat credentials
    const vendorCredentials = await this.prisma.moamalatCredential.findUnique({
      where: { vendorId: shop.vendorId },
    });

    // If vendor has active credentials, return those
    if (vendorCredentials && vendorCredentials.isActive) {
      return {
        merchantId: vendorCredentials.merchantId,
        terminalId: vendorCredentials.terminalId,
        secureKey: vendorCredentials.secureKey,
        isVendorAccount: true,
      };
    }

    // Otherwise, return system default credentials
    const [merchantIdSetting, terminalIdSetting, secureKeySetting] = await Promise.all([
      this.prisma.systemSetting.findUnique({ where: { key: 'moamalat_merchant_id' } }),
      this.prisma.systemSetting.findUnique({ where: { key: 'moamalat_terminal_id' } }),
      this.prisma.systemSetting.findUnique({ where: { key: 'moamalat_secure_key' } }),
    ]);

    if (!merchantIdSetting || !terminalIdSetting || !secureKeySetting) {
      throw new NotFoundException('System Moamalat credentials are not properly configured');
    }

    return {
      merchantId: merchantIdSetting.value,
      terminalId: terminalIdSetting.value,
      secureKey: secureKeySetting.value,
      isVendorAccount: false,
    };
  }

  // Create or update vendor's Moamalat credentials
  async upsertVendorCredentials(vendorId: number, dto: CreateMoamalatCredentialDto) {
    // Check if vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Check if credentials already exist
    const existingCredentials = await this.prisma.moamalatCredential.findUnique({
      where: { vendorId },
    });

    if (existingCredentials) {
      // Update existing credentials
      return this.prisma.moamalatCredential.update({
        where: { id: existingCredentials.id },
        data: {
          merchantId: dto.merchantId,
          terminalId: dto.terminalId,
          secureKey: dto.secureKey,
          isActive: true,
        },
      });
    } else {
      // Create new credentials
      return this.prisma.moamalatCredential.create({
        data: {
          vendorId,
          merchantId: dto.merchantId,
          terminalId: dto.terminalId,
          secureKey: dto.secureKey,
          isActive: true,
        },
      });
    }
  }

  // Update vendor credentials
  async updateVendorCredentials(vendorId: number, dto: UpdateMoamalatCredentialDto) {
    const credentials = await this.prisma.moamalatCredential.findUnique({
      where: { vendorId },
    });

    if (!credentials) {
      throw new NotFoundException(`Moamalat credentials for vendor ID ${vendorId} not found`);
    }

    return this.prisma.moamalatCredential.update({
      where: { id: credentials.id },
      data: dto,
    });
  }

  // Enable/disable vendor credentials
  async toggleCredentialStatus(vendorId: number, isActive: boolean) {
    const credentials = await this.prisma.moamalatCredential.findUnique({
      where: { vendorId },
    });

    if (!credentials) {
      throw new NotFoundException(`Moamalat credentials for vendor ID ${vendorId} not found`);
    }

    return this.prisma.moamalatCredential.update({
      where: { id: credentials.id },
      data: { isActive },
    });
  }

  // Get vendor credentials
  async getVendorCredentials(vendorId: number) {
    const credentials = await this.prisma.moamalatCredential.findUnique({
      where: { vendorId },
      select: {
        id: true,
        merchantId: true,
        terminalId: true,
        secureKey: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!credentials) {
      throw new NotFoundException(`Moamalat credentials for vendor ID ${vendorId} not found`);
    }

    return credentials;
  }

  // Admin: Set system default credentials
  async setSystemCredentials(dto: MoamalatSystemSettingsDto) {
    await this.prisma.$transaction([
      this.prisma.systemSetting.upsert({
        where: { key: 'moamalat_merchant_id' },
        update: { value: dto.merchantId },
        create: {
          key: 'moamalat_merchant_id',
          value: dto.merchantId,
          description: 'Default Merchant ID for Moamalat payment gateway',
        },
      }),
      this.prisma.systemSetting.upsert({
        where: { key: 'moamalat_terminal_id' },
        update: { value: dto.terminalId },
        create: {
          key: 'moamalat_terminal_id',
          value: dto.terminalId,
          description: 'Default Terminal ID for Moamalat payment gateway',
        },
      }),
      this.prisma.systemSetting.upsert({
        where: { key: 'moamalat_secure_key' },
        update: { value: dto.secureKey },
        create: {
          key: 'moamalat_secure_key',
          value: dto.secureKey,
          description: 'Default Secure Key for Moamalat payment gateway',
        },
      }),
    ]);

    return {
      message: 'System Moamalat credentials updated successfully',
    };
  }

  // Admin: Get system default credentials
  async getSystemCredentials() {
    const [merchantIdSetting, terminalIdSetting, secureKeySetting] = await Promise.all([
      this.prisma.systemSetting.findUnique({ where: { key: 'moamalat_merchant_id' } }),
      this.prisma.systemSetting.findUnique({ where: { key: 'moamalat_terminal_id' } }),
      this.prisma.systemSetting.findUnique({ where: { key: 'moamalat_secure_key' } }),
    ]);

    if (!merchantIdSetting || !terminalIdSetting || !secureKeySetting) {
      throw new NotFoundException('System Moamalat credentials are not configured');
    }

    return {
      merchantId: merchantIdSetting.value,
      terminalId: terminalIdSetting.value,
      secureKey: secureKeySetting.value,
      updatedAt: merchantIdSetting.updatedAt,
    };
  }

  /**
   * Generate payment parameters for Moamalat frontend integration
   */
  async preparePaymentParameters(shopId: number, amount: number, merchantReference: string, userId: number) {
    // Get Moamalat credentials for this shop
    const credentials = await this.getMoamalatCredentials(shopId);
    
    // Generate current date time in UTC format
    const dateTimeLocalTrxn = new Date().toUTCString();
    
    // Amount needs to be formatted with trailing zeros (cents/millisLYD)
    const formattedAmount = `${Math.round(amount)}000`;
    
    // Create hash data string
    const strHashData = `Amount=${formattedAmount}&DateTimeLocalTrxn=${dateTimeLocalTrxn}&MerchantId=${credentials.merchantId}&MerchantReference=${merchantReference}&TerminalId=${credentials.terminalId}`;
    
    // Convert secure key from hex to ASCII and generate HMAC
    const secureKeyAscii = this.hexToAscii(credentials.secureKey);
    const hmac = createHmac('sha256', secureKeyAscii)
      .update(strHashData)
      .digest('hex')
      .toUpperCase();
    
    // Return configuration object for frontend
    return {
      MID: credentials.merchantId,
      TID: credentials.terminalId,
      AmountTrxn: formattedAmount,
      MerchantReference: merchantReference,
      TrxDateTime: dateTimeLocalTrxn,
      SecureHash: hmac
    };
  }

  /**
   * Helper method to convert hex to ASCII
   */
  private hexToAscii(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    }
    return str;
  }
}