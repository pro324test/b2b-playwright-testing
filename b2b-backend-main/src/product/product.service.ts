import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductCityOverrideDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { ProductFilterDto, ProductStatus } from './dto/product-filter.dto';
import { preparePaginationParams, createPaginatedResponse } from './helpers/product-pagination';

// Import all helpers using namespace pattern
import * as ProductCore from './helpers/product-core-operations';
import * as ProductCity from './helpers/product-city-operations';
import * as ProductQuery from './helpers/product-query-operations';
import * as ProductPrice from './helpers/product-price-operations';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Core product operations
  async createProduct(shopId: number, dto: any) {
    return ProductCore.createProduct(this.prisma, shopId, dto);
  }

  async updateProduct(productId: number, dto: any, vendorId: number) {
    return ProductCore.updateProduct(this.prisma, productId, dto, vendorId);
  }

  async findOne(id: number) {
    // First get the basic product using the core helper
    const product = await ProductCore.findOne(this.prisma, id);
    
    // Then enhance it with pricing information that includes rule sources
    return ProductPrice.enhanceProductWithPricing(this.prisma, product);
  }

  async enableProduct(productId: number, vendorId: number) {
    return ProductCore.enableProduct(this.prisma, productId, vendorId);
  }

  async disableProduct(productId: number, vendorId: number) {
    return ProductCore.disableProduct(this.prisma, productId, vendorId);
  }

  async deleteProduct(productId: number, vendorId: number) {
    return ProductCore.deleteProduct(this.prisma, productId, vendorId);
  }

  // City-related operations - using ProductCity helper
  async checkProductAvailabilityInCity(productId: number, cityId: number): Promise<boolean> {
    return ProductCity.checkProductAvailabilityInCity(this.prisma, productId, cityId);
  }

  async getProductAvailableCities(productId: number) {
    return ProductCity.getProductAvailableCities(this.prisma, productId);
  }

  async getProductsByCityId(cityId: number, paginationDto?: PaginationDto) {
    return ProductCity.getProductsByCityId(this.prisma, cityId, paginationDto);
  }

  // Query operations - using ProductQuery helper
  async getProductsByShop(shopId: number, paginationDto?: PaginationDto) {
    return ProductQuery.getProductsByShop(this.prisma, shopId, paginationDto);
  }

  async getProductsByVendor(vendorId: number, filterDto: ProductFilterDto) {
    return ProductQuery.getProductsByVendor(this.prisma, vendorId, filterDto);
  }
  
  async getAllProducts(paginationDto?: PaginationDto) {
    return ProductQuery.getAllProducts(this.prisma, paginationDto);
  }
}