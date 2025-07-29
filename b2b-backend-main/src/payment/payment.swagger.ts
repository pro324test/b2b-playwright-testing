import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const ConfirmPaymentSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User/Admin] Confirm payment for an order',
      description: 'Records a payment for an order. Can be used for partial or full payments. Updates the order payment status accordingly.'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: ConfirmPaymentDto,
      description: 'Payment confirmation details',
      examples: {
        fullPayment: {
          summary: 'Full payment',
          value: {
            orderId: 1,
            amount: 349.99,
            paymentMethod: 'bank_transfer',
            transactionId: 'TXN123456789'
          }
        },
        partialPayment: {
          summary: 'Partial payment',
          value: {
            orderId: 1,
            amount: 100.00,
            paymentMethod: 'credit_card',
            transactionId: 'CCT987654321'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Payment confirmed successfully',
      schema: {
        properties: {
          payment: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 2 },
              orderId: { type: 'number', example: 1 },
              amount: { type: 'number', example: 100.00 },
              paymentMethod: { type: 'string', example: 'credit_card' },
              transactionId: { type: 'string', example: 'CCT987654321' },
              status: { type: 'string', example: 'completed' },
              completedAt: { type: 'string', example: '2025-03-01T14:30:00Z' },
            }
          },
          order: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              paidAmount: { type: 'number', example: 249.99 },
              paymentStatus: { type: 'string', example: 'partially_paid' },
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad request - Payment amount exceeds the remaining balance',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Payment amount cannot exceed the remaining balance of 100.00' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Authentication required'
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - User does not have permission to confirm payment',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have permission to confirm payment for this order' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Order not found'
    }),
  );
};

export const GetPaymentHistorySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User] Get payment history',
      description: 'Retrieves payment history for the authenticated user. Can be filtered by order ID.'
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'orderId',
      required: false,
      type: Number,
      description: 'Filter payments by specific order ID',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, createdAt, amount, status, paymentMethod)',
    }),
    ApiResponse({
      status: 200,
      description: 'Payment history retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number', example: 1 },
                orderId: { type: 'number', example: 5 },
                amount: { type: 'number', example: 149.99 },
                paymentMethod: { type: 'string', example: 'credit_card' },
                transactionId: { type: 'string', example: 'TXN123456789' },
                status: { type: 'string', example: 'completed' },
                createdAt: { type: 'string', example: '2025-03-01T10:30:00Z' },
                completedAt: { type: 'string', example: '2025-03-01T10:35:00Z' },
                order: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 5 },
                    orderNumber: { type: 'string', example: 'ORD-1677620378123-1-2' },
                    totalAmount: { type: 'number', example: 299.99 },
                    shop: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 2 },
                        name: { type: 'string', example: 'Office Supplies Ltd.' },
                        logoUrl: { type: 'string', example: 'https://example.com/logo.jpg' }
                      }
                    }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 15 },
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
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Authentication required'
    }),
  );
};

export const GetOrderPaymentsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User/Vendor/Admin] Get payments for an order',
      description: 'Retrieves all payments for a specific order. Accessible by the order customer, vendor, or admin.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'orderId',
      type: 'number',
      description: 'Order ID',
      required: true,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, createdAt, amount, status, paymentMethod)',
    }),
    ApiResponse({
      status: 200,
      description: 'Order payments retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number', example: 1 },
                orderId: { type: 'number', example: 1 },
                amount: { type: 'number', example: 100.00 },
                paymentMethod: { type: 'string', example: 'credit_card' },
                transactionId: { type: 'string', example: 'TXN123456789' },
                status: { type: 'string', example: 'completed' },
                createdAt: { type: 'string', example: '2025-03-01T10:30:00Z' },
                completedAt: { type: 'string', example: '2025-03-01T10:35:00Z' },
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 3 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'desc' }
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
      description: 'Forbidden - User does not have permission to view payments for this order'
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Order not found'
    }),
  );
};

export const GetShopPaymentsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor/Admin] Get payments for a shop',
      description: 'Retrieves all payments for orders placed with a specific shop. Only accessible by the shop owner or admin.'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'shopId',
      type: 'number',
      description: 'Shop ID',
      required: true,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      enum: SortDirection,
      description: 'Sort direction (asc or desc)',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by (id, createdAt, amount, status, paymentMethod)',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Filter by payment status (unpaid, partially_paid, paid)',
    }),
    ApiResponse({
      status: 200,
      description: 'Shop payments retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number', example: 1 },
                amount: { type: 'number', example: 149.99 },
                paymentMethod: { type: 'string', example: 'credit_card' },
                transactionId: { type: 'string', example: 'TXN123456789' },
                status: { type: 'string', example: 'completed' },
                createdAt: { type: 'string', example: '2025-03-01T10:30:00Z' },
                completedAt: { type: 'string', example: '2025-03-01T10:35:00Z' },
                order: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 5 },
                    orderNumber: { type: 'string', example: 'ORD-1677620378123-1-2' },
                    totalAmount: { type: 'number', example: 299.99 },
                    paidAmount: { type: 'number', example: 149.99 },
                    paymentStatus: { type: 'string', example: 'partially_paid' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 12 },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        email: { type: 'string', example: 'john.doe@example.com' },
                        username: { type: 'string', example: 'johndoe' }
                      }
                    }
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: { type: 'number', example: 15 },
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
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Authentication required'
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - User does not have permission to view payments for this shop',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'You do not have permission to view payments for this shop' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found'
    }),
  );
};