import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InventoryService } from '../inventory/inventory.service';
import { PaginationDto, SortDirection } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { ProductVariantService } from '../product/product-variant.service';
import { CouponService } from '../coupon/coupon.service';

// Import helpers using namespace pattern
import * as OrderAccessControl from './helpers/order-access-control';
import * as OrderTransaction from './helpers/order-transaction';
import * as OrderDataProcessing from './helpers/order-data-processing';
import * as OrderInventory from './helpers/order-inventory-operations';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
    private productVariantService: ProductVariantService,
    private couponService: CouponService,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { shopId, cartId, notes, paymentMethod, transactionId } = createOrderDto;
    
    // Get cart with items, products, and variants
    const cart = await this.prisma.cart.findFirst({
      where: {
        id: cartId,
        userId,
        isCheckedOut: false,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: true,
              },
            },
            variant: {
              include: {
                attributeValues: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found or already checked out');
    }

    // Use helper to validate and filter shop items
    const shopItems = OrderTransaction.validateShopItems(cart, shopId);
    
    // Use inventory helper to validate inventory for all items
    await OrderInventory.validateInventoryForOrder(
      this.inventoryService,
      this.productVariantService,
      shopItems
    );
    
    // Generate a reservation ID for this order attempt
    const reservationId = `order-${userId}-${cartId}-${Date.now()}`;
    
    try {
      // Reserve inventory for items (creates reservation records and reduces stock)
      await OrderInventory.reserveInventory(
        this.prisma,
        this.inventoryService,
        this.productVariantService,
        shopItems,
        reservationId,
        30 // expire after 30 minutes
      );
      
      // Get coupon info from cart
      const couponDiscount = cart.couponDiscount ? Number(cart.couponDiscount) : 0;
      
      // Calculate order totals using helper
      const { subtotal, totalAmount } = OrderTransaction.calculateOrderTotals(shopItems, couponDiscount);
      
      // Execute the order transaction using helper with new payment parameters
      const order = await OrderTransaction.executeOrderTransaction(
        this.prisma,
        userId,
        shopId,
        shopItems,
        cart,
        subtotal,
        couponDiscount,
        totalAmount,
        this.productVariantService,
        this.inventoryService,
        this.couponService,
        paymentMethod,
        transactionId,
        notes
      );
      
      // Mark reservations as consumed (they are now part of a completed order)
      await OrderInventory.consumeReservations(
        this.prisma,
        reservationId
      );
      
      return order;
    } catch (error) {
      // If anything fails during order creation, release the reserved inventory
      await OrderInventory.releaseReservedInventory(
        this.prisma,
        this.inventoryService,
        this.productVariantService,
        reservationId
      );
      
      // Re-throw the error to be handled by the controller
      throw error;
    }
  }

  /**
   * Get all orders for the current user with enhanced product details
   */
  async getUserOrders(userId: number, paginationDto?: PaginationDto) {
    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'id' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'orderNumber', 'createdAt', 'status', 'totalAmount'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'id';

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  attributeValues: {
                    include: {
                      attribute: true
                    }
                  }
                }
              }, 
              product: {
                include: {
                  images: true,  // Include all product images
                  shop: true,    // Include shop details
                  brand: true    // Include brand details
                }
              }
            }
          },
          payments: true,
          shop: {
            include: {
              vendor: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
        }
      }),
      this.prisma.order.count({
        where: { userId }
      })
    ]);

    // Process data for all orders using helper
    OrderDataProcessing.processOrdersData(orders);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: orders,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: actualSortBy,
        sortDirection
      }
    };
  }

  async getShopOrders(shopId: number, userId: number, paginationDto?: PaginationDto) {
    // Use helper to verify vendor access
    await OrderAccessControl.verifyVendorAccess(this.prisma, shopId, userId);

    const { 
      page = 1, 
      limit = 10, 
      sortDirection = SortDirection.DESC, 
      sortBy = 'createdAt' 
    } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'orderNumber', 'createdAt', 'status', 'totalAmount', 'paymentStatus'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where: { shopId },
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
        include: {
          items: {
            include: {
              variant: true, // Include variant info
              product: true  // Include product info
            }
          },
          payments: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        }
      }),
      this.prisma.order.count({
        where: { shopId }
      })
    ]);

    // Process data for all orders using helper
    OrderDataProcessing.processOrdersData(orders);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: orders,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: actualSortBy,
        sortDirection
      }
    };
  }

  async getOrderById(id: number, userId: number) {
    // Use helper to check order access
    const { isCustomer, isVendor } = await OrderAccessControl.checkOrderAccess(
      this.prisma,
      id,
      userId
    );
    
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: true, // Include variant info
            product: true  // Include product info
          }
        },
        payments: true,
        shop: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Process order data with helper
    OrderDataProcessing.processOrderData(order);
    
    // Add additional summary information for single order view
    OrderDataProcessing.addOrderSummary(order);
    OrderDataProcessing.formatOrderAmounts(order);

    return order;
  }

  async updateOrderStatus(id: number, updateOrderDto: UpdateOrderDto, userId: number) {
    // Use helper to verify vendor order access
    await OrderAccessControl.verifyVendorOrderAccess(
      this.prisma,
      id,
      userId
    );

    // Get current order to handle inventory adjustments if needed
    const currentOrder = await this.prisma.order.findUnique({
      where: { id },
      select: { 
        status: true,
        paymentStatus: true,
        totalAmount: true
      }
    });

    if (!currentOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Handle inventory changes for cancelled orders
    if (updateOrderDto.status === 'cancelled' && currentOrder.status !== 'cancelled') {
      // Cancellation: return items to inventory
      const orderItems = await this.prisma.orderItem.findMany({
        where: { orderId: id }
      });
      
      // Use inventory helper to return stock
      await OrderInventory.adjustInventoryForOrderItems(
        this.inventoryService,
        this.productVariantService,
        orderItems,
        'add'
      );
    }

    // If order is being marked as delivered, handle COD payment completion
    if (updateOrderDto.status === 'delivered' && currentOrder.status !== 'delivered') {
      // Check if this is a COD order with pending payment
      const codPayment = await this.prisma.payment.findFirst({
        where: { 
          orderId: id,
          paymentMethod: 'cod',
          status: 'pending'
        }
      });
      
      if (codPayment) {
        // Get the current timestamp for payment completion
        const paymentCompletionDate = new Date();
        
        // Update payment status with completion date
        await this.prisma.payment.update({
          where: { id: codPayment.id },
          data: {
            status: 'completed',
            completedAt: paymentCompletionDate
          }
        });
        
        // Also update order payment status
        updateOrderDto.paymentStatus = 'paid';
        
        // Set paidAmount if it wasn't already paid
        if (currentOrder.paymentStatus !== 'paid') {
          await this.prisma.order.update({
            where: { id },
            data: {
              paidAmount: currentOrder.totalAmount,
              updatedAt: paymentCompletionDate // Use the existing updatedAt field instead
            }
          });
        }
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        items: {
          include: {
            variant: true,
            product: true
          }
        },
        payments: true,
      },
    });

    // Process order data with helper
    OrderDataProcessing.processOrderData(updatedOrder);

    return updatedOrder;
  }

  /**
 * Get all orders (admin only)
 * Allows admins to view all orders in the system with filtering options
 */
async getAllOrdersAdmin(
  paginationDto?: PaginationDto, 
  filters?: { 
    status?: string, 
    paymentStatus?: string,
    shopId?: number,
    startDate?: Date,
    endDate?: Date
  }
) {
  // Destructure pagination parameters
  const { 
    page = 1, 
    limit = 10, 
    sortDirection = SortDirection.DESC, 
    sortBy = 'createdAt' 
  } = paginationDto || {};
  
  const skip = (page - 1) * limit;
  const sortOrder = sortDirection.toLowerCase() as Prisma.SortOrder;

  // Validate sortBy field to prevent SQL injection
  const validSortFields = ['id', 'orderNumber', 'createdAt', 'status', 'totalAmount', 'paymentStatus'];
  const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  // Build where clause based on filters
  const where: Prisma.OrderWhereInput = {};
  
  if (filters?.status) {
    where.status = filters.status;
  }
  
  if (filters?.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }
  
  if (filters?.shopId) {
    where.shopId = filters.shopId;
  }
  
  // Date range filter
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  // Execute query with pagination
  const [orders, totalCount] = await Promise.all([
    this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [actualSortBy]: sortOrder },
      include: {
        items: {
          include: {
            variant: true,
            product: true
          }
        },
        payments: true,
        shop: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true
          }
        }
      }
    }),
    this.prisma.order.count({ where })
  ]);

  // Process order data with helper functions
  OrderDataProcessing.processOrdersData(orders);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: orders,
    meta: {
      totalItems: totalCount,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      sortBy: actualSortBy,
      sortDirection,
      filters: {
        status: filters?.status || null,
        paymentStatus: filters?.paymentStatus || null,
        shopId: filters?.shopId || null,
        dateRange: (filters?.startDate || filters?.endDate) ? {
          start: filters.startDate,
          end: filters.endDate
        } : null
      }
    }
  };
}

}
