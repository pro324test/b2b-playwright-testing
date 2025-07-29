import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductVariantService } from '../product/product-variant.service';
import { CouponService } from '../coupon/coupon.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: any;
  let inventoryService: any;
  let productVariantService: any;
  let couponService: any;

  // Mock order data
  const mockOrder = {
    id: 1,
    orderNumber: 'ORD-12345',
    userId: 1,
    shopId: 1,
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 100,
    subtotal: 100,
    discountAmount: 0,
    shippingAmount: 0,
    notes: 'Test notes',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        variantId: 1,
        quantity: 2,
        price: 50,
        totalPrice: 100,
        product: {
          id: 1,
          name: 'Test Product',
          basePrice: 50,
          shop: { id: 1, name: 'Test Shop' }
        },
        variant: {
          id: 1,
          sku: 'SKU123',
          quantity: 10,
          price: 50
        }
      }
    ],
    payments: [],
    shop: { id: 1, name: 'Test Shop' },
    user: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    }
  };

  // Mock cart data
  const mockCart = {
    id: 1,
    userId: 1,
    isCheckedOut: false,
    items: [
      {
        id: 1,
        productId: 1,
        variantId: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'Test Product',
          basePrice: 50,
          shopId: 1,
          shop: { id: 1, name: 'Test Shop' }
        },
        variant: {
          id: 1,
          sku: 'SKU123',
          quantity: 10,
          price: 50,
          attributeValues: []
        }
      }
    ]
  };

  beforeEach(async () => {
    // Create mock services
    prisma = {
      $transaction: jest.fn(callback => callback(prisma)),
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
      },
      orderItem: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      cart: {
        findFirst: jest.fn(),
        update: jest.fn()
      },
      shop: {
        findUnique: jest.fn(),
        findFirst: jest.fn()
      },
      user: {
        findUnique: jest.fn()
      },
      inventory: {
        update: jest.fn()
      },
      productVariant: {
        update: jest.fn()
      }
    };

    inventoryService = {
      findOne: jest.fn(),
      adjustStock: jest.fn(),
      checkStock: jest.fn()
    };

    productVariantService = {
      checkStock: jest.fn(),
      getEffectivePrice: jest.fn()
    };

    couponService = {
      recordCouponUsage: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: InventoryService, useValue: inventoryService },
        { provide: ProductVariantService, useValue: productVariantService },
        { provide: CouponService, useValue: couponService }
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto = {
      cartId: 1,
      shopId: 1,
      notes: 'Test notes',
      paymentPercentage: 100,
      paymentType: 'immediate'
    };

    beforeEach(() => {
      prisma.cart.findFirst.mockResolvedValue(mockCart);
      inventoryService.checkStock.mockResolvedValue(true);
      productVariantService.checkStock.mockResolvedValue(true);
      productVariantService.getEffectivePrice.mockResolvedValue(50);
      prisma.order.create.mockResolvedValue(mockOrder);
    });

    it('should create an order successfully', async () => {
      const result = await service.createOrder(1, createOrderDto as any);
      
      expect(prisma.cart.findFirst).toHaveBeenCalled();
      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.cart.update).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when cart not found', async () => {
      prisma.cart.findFirst.mockResolvedValue(null);
      
      await expect(service.createOrder(1, createOrderDto as any))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      inventoryService.checkStock.mockResolvedValue(false);
      
      await expect(service.createOrder(1, createOrderDto as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserOrders', () => {
    beforeEach(() => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);
    });

    it('should return user orders with pagination', async () => {
      const result = await service.getUserOrders(1, { page: 1, limit: 10 });
      
      expect(prisma.order.findMany).toHaveBeenCalled();
      expect(prisma.order.count).toHaveBeenCalled();
      expect(result.data).toEqual([mockOrder]);
      expect(result.meta.totalItems).toEqual(1);
    });
  });

  describe('getShopOrders', () => {
    beforeEach(() => {
      prisma.shop.findFirst.mockResolvedValue({ id: 1, vendorId: 1, vendor: { userId: 1 } });
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'vendor' });
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);
    });

    it('should return shop orders when user is shop owner', async () => {
      const result = await service.getShopOrders(1, 1, { page: 1, limit: 10 });
      
      expect(prisma.order.findMany).toHaveBeenCalled();
      expect(prisma.order.count).toHaveBeenCalled();
      expect(result.data).toEqual([mockOrder]);
      expect(result.meta.totalItems).toEqual(1);
    });

    it('should return shop orders when user is admin', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 2, role: 'admin' });
      
      const result = await service.getShopOrders(1, 2, { page: 1, limit: 10 });
      
      expect(prisma.order.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([mockOrder]);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      prisma.shop.findFirst.mockResolvedValue({ id: 1, vendorId: 1, vendor: { userId: 1 } });
      prisma.user.findUnique.mockResolvedValue({ id: 2, role: 'vendor' });
      
      await expect(service.getShopOrders(1, 2, { page: 1, limit: 10 }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOrderById', () => {
    beforeEach(() => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
    });

    it('should return an order when user is customer', async () => {
      const result = await service.getOrderById(1, 1);
      
      expect(prisma.order.findUnique).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      
      await expect(service.getOrderById(1, 1))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrderStatus', () => {
    beforeEach(() => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.shop.findFirst.mockResolvedValue({ id: 1, vendorId: 1, vendor: { userId: 1 } });
      prisma.user.findUnique.mockResolvedValue({ id: 1, role: 'vendor' });
      prisma.order.update.mockResolvedValue({...mockOrder, status: 'completed'});
      prisma.orderItem.findMany.mockResolvedValue(mockOrder.items);
    });

    it('should update order status when user has access', async () => {
      const result = await service.updateOrderStatus(1, { status: 'completed' } as any, 1);
      
      expect(prisma.order.update).toHaveBeenCalled();
      expect(result.status).toEqual('completed');
    });

    it('should throw ForbiddenException when user has no access', async () => {
      prisma.shop.findFirst.mockResolvedValue({ id: 1, vendorId: 1, vendor: { userId: 1 } });
      prisma.user.findUnique.mockResolvedValue({ id: 2, role: 'vendor' });
      
      await expect(service.updateOrderStatus(1, { status: 'completed' } as any, 2))
        .rejects.toThrow(ForbiddenException);
    });

    it('should adjust inventory when order is cancelled', async () => {
      await service.updateOrderStatus(1, { status: 'cancelled' } as any, 1);
      
      expect(inventoryService.adjustStock).toHaveBeenCalled();
    });
  });

  describe('getAllOrdersAdmin', () => {
    beforeEach(() => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);
    });

    it('should return all orders with pagination', async () => {
      const result = await service.getAllOrdersAdmin({ page: 1, limit: 10 });
      
      expect(prisma.order.findMany).toHaveBeenCalled();
      expect(prisma.order.count).toHaveBeenCalled();
      expect(result.data).toEqual([mockOrder]);
      expect(result.meta.totalItems).toEqual(1);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        status: 'pending',
        paymentStatus: 'pending',
        shopId: 1,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31')
      };
      
      await service.getAllOrdersAdmin({ page: 1, limit: 10 }, filters);
      
      expect(prisma.order.findMany).toHaveBeenCalled();
      const whereArg = prisma.order.findMany.mock.calls[0][0].where;
      
      expect(whereArg.status).toEqual('pending');
      expect(whereArg.paymentStatus).toEqual('pending');
      expect(whereArg.shopId).toEqual(1);
      expect(whereArg.createdAt.gte).toEqual(filters.startDate);
      expect(whereArg.createdAt.lte).toEqual(filters.endDate);
    });
  });
});