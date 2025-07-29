import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from './dto/update-price-rule.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';

// Import helper functions
import * as CoreOperations from './helpers/core-operations';
import * as ProductRules from './helpers/product-rules';
import * as RuleStatus from './helpers/rule-status';
import * as VendorRules from './helpers/vendor-rules';

@Injectable()
export class PriceRuleService {
  constructor(private prisma: PrismaService) {}

  // Using core-operations helper methods
  async create(createPriceRuleDto: CreatePriceRuleDto, creatorId: number, creatorType: string, vendorId?: number) {
    return CoreOperations.create(this.prisma, createPriceRuleDto, creatorId, creatorType, vendorId);
  }

  async findOne(id: number) {
    return CoreOperations.findOne(this.prisma, id);
  }

  async update(id: number, updatePriceRuleDto: UpdatePriceRuleDto, userId: number, userType: string, userRole?: string, newVendorId?: number) {
    return CoreOperations.update(this.prisma, id, updatePriceRuleDto, userId, userType, userRole, newVendorId);
  }

  // Using vendor-rules helper method
  async findAll(includeInactive = false, paginationDto?: PaginationDto, userId?: number, userType?: string, userRole?: string) {
    return VendorRules.findAll(this.prisma, includeInactive, paginationDto, userId, userType, userRole);
  }

  // Using rule-status helper methods
  async remove(id: number, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return RuleStatus.remove(this.prisma, id, currentUserId, currentUserType, currentUserRole);
  }

  async enable(id: number, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return RuleStatus.enable(this.prisma, id, currentUserId, currentUserType, currentUserRole);
  }

  async disable(id: number, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return RuleStatus.disable(this.prisma, id, currentUserId, currentUserType, currentUserRole);
  }

  // Using the product-rules helper functions
  async findActiveRulesForProduct(productId: number, paginationDto?: PaginationDto, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return ProductRules.findActiveRulesForProduct(this.prisma, productId, paginationDto, currentUserId, currentUserType, currentUserRole);
  }

  async findActiveRulesForVariant(variantId: number, paginationDto?: PaginationDto, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return ProductRules.findActiveRulesForVariant(this.prisma, variantId, paginationDto, currentUserId, currentUserType, currentUserRole);
  }

  // Using the vendor-rules helper functions
  async findActiveRulesForVendorGroup(vendorGroupId: number, paginationDto?: PaginationDto, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return VendorRules.findActiveRulesForVendorGroup(this.prisma, vendorGroupId, paginationDto, currentUserId, currentUserType, currentUserRole);
  }

  async findActiveRulesForVendor(vendorId: number, paginationDto?: PaginationDto, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return VendorRules.findActiveRulesForVendor(this.prisma, vendorId, paginationDto, currentUserId, currentUserType, currentUserRole);
  }
  
  async findActiveRulesForShop(shopId: number, paginationDto?: PaginationDto, currentUserId?: number, currentUserType?: string, currentUserRole?: string) {
    return VendorRules.findActiveRulesForShop(this.prisma, shopId, paginationDto, currentUserId, currentUserType, currentUserRole);
  }

  async findMyRules(vendorId: number, paginationDto?: PaginationDto, userId?: number) {
    // This will call our custom implementation for "my rules"
    return VendorRules.findMyRules(this.prisma, vendorId, paginationDto, userId);
  }
}