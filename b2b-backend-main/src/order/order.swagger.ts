import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SortDirection } from '../common/dto/pagination.dto';



export const GetOrdersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Get all orders for authenticated user',
      description: `Retrieves a paginated list of all orders placed by the authenticated user across all shops.
      
The response includes:
- Basic order information (ID, number, status)
- Payment details (amount, status)
- Shop information
- Order metadata (creation date, item count, etc.)
- Pagination information for navigating through orders

Orders are typically sorted by creation date (newest first) but can be sorted by other fields.`
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, orderNumber, createdAt, status, totalAmount, paymentStatus)'
    }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled)'
    }),
    ApiQuery({
      name: 'paymentStatus',
      required: false,
      type: String,
      description: 'Filter by payment status (paid, partially_paid, unpaid)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Orders retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                orderNumber: { type: 'string', example: 'ORD-1647859412345-5-1' },
                totalAmount: { type: 'number', example: 174.49 },
                paymentStatus: { type: 'string', example: 'paid' },
                status: { type: 'string', example: 'pending' },
                createdAt: { type: 'string', format: 'date-time' },
                shop: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Fashion Shop' }
                  }
                },
                hasCoupon: { type: 'boolean', example: true },
                totalItemQuantity: { type: 'number', example: 5 },
                formattedTotalAmount: { type: 'string', example: '174.49' }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 12 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 2 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' }),
  );
};

export const GetShopOrdersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Get all orders for a specific shop',
      description: `Retrieves a paginated list of all orders placed with a specific shop owned by the vendor.
      
The response includes:
- Complete order information for all shop orders
- Customer details for each order
- Detailed payment status information
- Order timestamps and metadata
- Pagination controls for navigating large order sets

This endpoint is restricted to the shop owner (vendor) and allows tracking and managing all orders for the shop.`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'shopId',
      type: 'number',
      description: 'ID of the shop to get orders for',
      required: true,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, orderNumber, createdAt, status, totalAmount, paymentStatus)'
    }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled)'
    }),
    ApiQuery({
      name: 'paymentStatus',
      required: false,
      type: String,
      description: 'Filter by payment status (paid, partially_paid, unpaid)'
    }),
    ApiResponse({
      status: 200,
      description: 'Shop orders retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                orderNumber: { type: 'string', example: 'ORD-1647859412345-5-1' },
                totalAmount: { type: 'number', example: 174.49 },
                paymentStatus: { type: 'string', example: 'paid' },
                status: { type: 'string', example: 'pending' },
                createdAt: { type: 'string', format: 'date-time' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 5 },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'john.doe@example.com' }
                  }
                },
                hasCoupon: { type: 'boolean', example: true },
                totalItemQuantity: { type: 'number', example: 5 },
                formattedTotalAmount: { type: 'string', example: '174.49' }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 25 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 3 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - User does not own this shop',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have permission to view orders for this shop' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Shop with ID 123 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    }),
  );
};

export const GetOrderByIdSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User/Vendor] Get order by ID',
      description: `Retrieves complete details about a specific order.
      
This endpoint provides the most comprehensive view of an order including:
- Full order details with line items
- Complete product and variant information for each item
- Payment history and status
- Customer information
- Applied promotions and discounts
- Formatted monetary amounts for easier display
- Order summary statistics (counts, totals, etc.)

Access is restricted to either:
- The customer who placed the order
- The vendor who owns the shop where the order was placed`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Order ID',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Order retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          orderNumber: { type: 'string', example: 'ORD-1647859412345-5-1' },
          userId: { type: 'number', example: 5 },
          shopId: { type: 'number', example: 1 },
          totalAmount: { type: 'number', example: 174.49 },
          formattedTotalAmount: { type: 'string', example: '174.49' },
          paidAmount: { type: 'number', example: 174.49 },
          formattedPaidAmount: { type: 'string', example: '174.49' },
          paymentStatus: { type: 'string', example: 'paid' },
          status: { type: 'string', example: 'pending' },
          notes: { type: 'string', example: 'Please deliver during work hours' },
          couponCode: { type: 'string', example: 'SUMMER25', nullable: true },
          couponDiscount: { type: 'number', example: 25.50, nullable: true },
          formattedCouponDiscount: { type: 'string', example: '25.50', nullable: true },
          hasCoupon: { type: 'boolean', example: true },
          uniqueItemCount: { type: 'number', example: 3 },
          totalItemQuantity: { type: 'number', example: 5 },
          promotedItemCount: { type: 'number', example: 2 },
          paymentDueDate: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                productId: { type: 'number', example: 7 },
                variantId: { type: 'number', example: 3, nullable: true },
                productName: { type: 'string', example: 'Premium Cotton T-Shirt' },
                quantity: { type: 'number', example: 2 },
                basePrice: { type: 'number', example: 29.99 },
                finalPrice: { type: 'number', example: 24.99 },
                appliedRuleId: { type: 'number', example: 5, nullable: true },
                hasPromotion: { type: 'boolean', example: true },
                appliedPromotions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', example: 'discount' },
                      amount: { type: 'number', example: 5 },
                      description: { type: 'string', example: '5$ off each item' }
                    }
                  }
                },
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 7 },
                    name: { type: 'string', example: 'Premium Cotton T-Shirt' },
                    imageUrl: { type: 'string', example: 'https://example.com/images/tshirt.jpg' }
                  }
                },
                variant: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'number', example: 3 },
                    sku: { type: 'string', example: 'TSH-RED-XL' },
                    attributeValues: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          attribute: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'Color' }
                            }
                          },
                          value: { type: 'string', example: 'Red' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          shop: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Fashion Shop' },
              logoUrl: { type: 'string', example: 'https://example.com/logos/fashionshop.jpg' }
            }
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              email: { type: 'string', example: 'john.doe@example.com' }
            }
          },
          payments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                amount: { type: 'number', example: 174.49 },
                paymentMethod: { type: 'string', example: 'bank_transfer' },
                status: { type: 'string', example: 'confirmed' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Authentication required' 
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Not your order', 
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have access to this order' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Order not found', 
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Order with ID 123 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    }),
  );
};

export const UpdateOrderStatusSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Update order status',
      description: `Updates the status of an order owned by the vendor's shop.
      
This endpoint allows vendors to change order status through its lifecycle:
- From pending → confirmed: Accept the order for processing
- From confirmed → processing: Begin preparing the order
- From processing → shipped: Mark order as shipped to customer
- From shipped → delivered: Mark order as successfully delivered and automatically confirm COD payments
- Any status → cancelled: Cancel the order (automatically returns inventory)

When an order with Cash on Delivery (COD) payment is marked as delivered, the system automatically:
- Updates the payment record status to 'completed'
- Changes the order's payment status to 'paid'
- Updates the paid amount to the full order amount

This automation removes the need for a separate payment confirmation step.`
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Order ID',
      required: true,
    }),
    ApiBody({
      type: UpdateOrderDto,
      examples: {
        confirm: {
          summary: 'Confirm Order',
          description: 'Accept the order and begin processing',
          value: {
            status: 'confirmed',
            notes: 'Your order has been confirmed and is being processed.'
          }
        },
        processing: {
          summary: 'Mark As Processing',
          description: 'Order is being prepared',
          value: {
            status: 'processing',
            notes: 'Your order is now being prepared for shipment.'
          }
        },
        shipped: {
          summary: 'Mark As Shipped',
          description: 'Order has been shipped to customer',
          value: {
            status: 'shipped',
            notes: 'Your order has been shipped. Tracking number: ABC123456789'
          }
        },
        delivered: {
          summary: 'Mark As Delivered',
          description: 'Order has been successfully delivered (automatically completes COD payment)',
          value: {
            status: 'delivered',
            notes: 'Your order was delivered on March 15, 2025. Cash payment received.'
          }
        },
        cancel: {
          summary: 'Cancel Order',
          description: 'Cancel the order and restore inventory',
          value: {
            status: 'cancelled',
            notes: 'Order cancelled as requested by customer. Inventory has been restored.'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Order status updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 42 },
          orderNumber: { type: 'string', example: 'ORD-1745070954598-4-1' },
          status: { type: 'string', example: 'delivered' },
          paymentStatus: { type: 'string', example: 'paid' },
          totalAmount: { type: 'string', example: '400' },
          paidAmount: { type: 'string', example: '400' },
          payments: { 
            type: 'array', 
            items: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'completed' },
                paymentMethod: { type: 'string', example: 'cod' },
                completedAt: { type: 'string', example: '2025-04-20T15:25:12.345Z' }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid order status transition', 
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Invalid status transition' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Not your shop order', 
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You can only update orders for your own shops' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Order not found', 
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Order with ID 42 not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    }),
  );
};

export const GetAllOrdersAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all orders across the system',
      description: `Administrative endpoint to view and filter all orders in the system regardless of shop.
      
This endpoint provides:
- Complete order listing with pagination
- Comprehensive filtering options (by status, payment, shop, date)
- Full order details with customer information
- Sort options for efficient order management

This powerful tool allows administrators to oversee all ordering activity and troubleshoot issues.`
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page'
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, orderNumber, createdAt, status, totalAmount, paymentStatus)'
    }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled)'
    }),
    ApiQuery({
      name: 'paymentStatus',
      required: false,
      type: String,
      description: 'Filter by payment status (paid, partially_paid, unpaid)'
    }),
    ApiQuery({
      name: 'shopId',
      required: false,
      type: Number,
      description: 'Filter by specific shop ID'
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      description: 'Filter orders after this date (ISO format: YYYY-MM-DD)'
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      description: 'Filter orders before this date (ISO format: YYYY-MM-DD)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Orders retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                orderNumber: { type: 'string', example: 'ORD-1647859412345-5-1' },
                totalAmount: { type: 'number', example: 174.49 },
                paymentStatus: { type: 'string', example: 'paid' },
                status: { type: 'string', example: 'delivered' }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 150 },
              itemsPerPage: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 15 },
              currentPage: { type: 'number', example: 1 }
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Authentication required' 
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Admin access required',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Access denied' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
  );
};