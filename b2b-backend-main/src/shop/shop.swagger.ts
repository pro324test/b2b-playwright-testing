import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RespondShopRequestDto } from './dto/respond-shop-request.dto';
import { UpdateShopDto } from './dto/update-shop.dto'; 
import { SortDirection } from '../common/dto/pagination.dto'; // Fix import path
export const CreateShopSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Request to create a shop',
      description: 'Only vendors can request to create shops. Each vendor can have multiple shops.'
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'My Tech Shop' },
          description: { type: 'string', example: 'Selling the latest tech gadgets and accessories' },
          logoUrl: { type: 'string', example: 'https://example.com/shop-logo.png' },
          cityIds: { 
            type: 'array', 
            items: { 
              type: 'number' 
            },
            example: [1, 2, 3],
            description: 'IDs of cities where this shop delivers'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Shop request submitted successfully',
      schema: {
        example: {
          id: 1,
          name: 'My Tech Shop',
          description: 'Selling the latest tech gadgets and accessories',
          logoUrl: 'https://example.com/shop-logo.png',
          status: 'pending',
          createdAt: '2025-03-05T10:30:00Z',
          vendor: {
            id: 3,
            user: {
              username: 'vendor_user'
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Only vendors can create shops' })
  );
};

export const RespondShopRequestSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Respond to shop request',
      description: 'Admin can accept or reject shop requests. Accepting will automatically enable the shop.'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: RespondShopRequestDto,
      examples: {
        accept: {
          summary: 'Accept shop request',
          value: { response: 'accept' }
        },
        reject: {
          summary: 'Reject shop request',
          value: { response: 'reject' }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Shop request responded successfully',
      schema: {
        example: {
          message: 'Shop request accepted successfully'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid response or shop status',
      schema: {
        example: {
          statusCode: 400,
          message: 'Invalid response. Must be accept or reject',
          error: 'Bad Request'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop request not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Shop with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetAllShopRequestsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all shop requests',
      description: 'Admin can view all pending shop requests with pagination'
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
      description: 'Field to sort by (id, name, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of shop requests with pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Tech Gadgets Shop' },
                description: { type: 'string', example: 'Selling the latest tech gadgets' },
                logoUrl: { type: 'string', example: 'https://example.com/logo.png', nullable: true },
                status: { type: 'string', example: 'pending', enum: ['pending', 'accepted', 'rejected'] },
                createdAt: { type: 'string', format: 'date-time', example: '2025-02-25T09:00:00Z' },
                vendor: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 3 },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 7 },
                        username: { type: 'string', example: 'vendor_user' },
                        email: { type: 'string', example: 'vendor@example.com' }
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
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetAllShopsPublicSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get all enabled shops',
      description: 'Public endpoint - Returns basic information about all enabled shops with pagination'
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
      description: 'Field to sort by (id, name)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of shops with basic information and pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Tech Gadgets Shop' },
                description: { type: 'string', example: 'Selling the latest tech gadgets' },
                logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
                vendor: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 3 },
                    user: {
                      type: 'object', 
                      properties: {
                        username: { type: 'string', example: 'vendor_user' }
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
              totalItems: { type: 'number', example: 25 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 3 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    })
  );
};

export const GetAllShopsAdminSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all shops with detailed information',
      description: 'Admin can view complete information about all shops including status, vendor details, etc.'
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
      description: 'Field to sort by (id, name, status, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of shops with complete information and pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Tech Gadgets Shop' },
                description: { type: 'string', example: 'Selling the latest tech gadgets' },
                logoUrl: { type: 'string', example: 'https://example.com/logo.png', nullable: true },
                status: { type: 'string', example: 'enabled', enum: ['pending', 'enabled', 'disabled', 'rejected'] },
                createdAt: { type: 'string', format: 'date-time', example: '2025-01-15T10:30:00Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-01-20T14:15:00Z' },
                vendor: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 3 },
                    isDisabled: { type: 'boolean', example: false },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 7 },
                        username: { type: 'string', example: 'vendor_user' },
                        email: { type: 'string', example: 'vendor@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Smith' },
                        role: { type: 'string', example: 'vendor' }
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
              totalItems: { type: 'number', example: 42 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 5 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'status' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetShopSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get shop details',
      description: 'Get detailed information about a specific shop including vendor details and recent products'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Shop details retrieved successfully',
      schema: {
        example: {
          id: 1,
          name: 'Tech Gadgets Shop',
          description: 'Selling the latest tech gadgets and accessories',
          logoUrl: 'https://example.com/shop-logo.png',
          status: 'enabled',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-02-10T14:20:00Z',
          vendorId: 3,
          vendor: {
            id: 3,
            isDisabled: false,
            user: {
              id: 7,
              username: 'vendor_user',
              email: 'vendor@example.com',
              firstName: 'John',
              lastName: 'Smith',
              role: 'vendor'
            }
          },
          products: [
            {
              id: 5,
              name: 'Wireless Earbuds',
              description: 'High-quality wireless earbuds with noise cancellation',
              price: 99.99,
              images: [
                {
                  id: 12,
                  path: 'https://example.com/earbuds.jpg',
                  imageType: 'main'
                }
              ],
              inventory: {
                quantity: 45,
                lowStockThreshold: 10
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Shop with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UpdateShopSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Owner/Admin Only] Update shop details',
      description: 'Update shop name, description, logo, or delivery cities. Vendors can only update their own shops. Admins can update any shop.'
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'New Shop Name' },
          description: { type: 'string', example: 'Updated shop description with more details' },
          logoUrl: { type: 'string', example: 'https://example.com/updated-logo.png' },
          cityIds: { 
            type: 'array', 
            items: { 
              type: 'number' 
            },
            example: [1, 2, 5],
            description: 'Updated list of city IDs where this shop delivers'
          }
        }
      },
      examples: {
        'Update Name': {
          value: { name: 'New Shop Name' }
        },
        'Update Description': {
          value: { description: 'Updated shop description with more details' }
        },
        'Update Logo': {
          value: { logoUrl: 'https://example.com/updated-logo.png' }
        },
        'Update Delivery Cities': {
          value: { cityIds: [1, 2, 5] }
        },
        'Complete Update': {
          value: {
            name: 'New Shop Name',
            description: 'Updated shop description',
            logoUrl: 'https://example.com/updated-logo.png',
            cityIds: [1, 2, 5]
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Shop updated successfully',
      schema: {
        example: {
          id: 1,
          name: 'New Shop Name',
          description: 'Updated shop description with more details',
          logoUrl: 'https://example.com/shop-logo.png',
          status: 'enabled',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-02-27T15:45:30Z',
          vendorId: 3,
          vendor: {
            id: 3,
            user: {
              username: 'vendor_user',
              email: 'vendor@example.com',
              firstName: 'John',
              lastName: 'Smith',
              role: 'vendor'
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - You can only update your own shops',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can only update your own shops',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Shop with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const EnableShopSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Enable shop',
      description: 'Enable a disabled or rejected shop. Admins can enable any shop. Vendors can only enable their own shops. Cannot enable shops of disabled vendors.'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Shop enabled successfully',
      schema: {
        example: {
          message: 'Shop enabled successfully'
        }
      } 
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Cannot enable shop when vendor is disabled',
      schema: {
        example: {
          statusCode: 400,
          message: 'Cannot enable shop when vendor is disabled',
          error: 'Bad Request'
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Not your shop or not enough permissions',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can only enable your own shops',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Shop with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DisableShopSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin/Vendor] Disable shop',
      description: 'Temporarily disable a shop. Admins can disable any shop. Vendors can only disable their own shops. This will prevent the shop and its products from being visible to customers.'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Shop disabled successfully',
      schema: {
        example: {
          message: 'Shop disabled successfully'
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Not your shop or not enough permissions',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can only disable your own shops',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Shop with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DeleteShopSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Owner/Admin Only] Delete shop',
      description: 'Permanently delete a shop that has no products. This operation cannot be undone.'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Shop deleted successfully',
      schema: {
        example: {
          message: 'Shop deleted successfully'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Shop has products',
      schema: {
        example: {
          statusCode: 400,
          message: 'Cannot delete shop with products. Delete all products first or disable the shop instead.',
          error: 'Bad Request'
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Only shop owner or admin can delete',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can only delete your own shops',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Shop not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Shop with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetVendorShopsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get vendor shops',
      description: 'Get all shops belonging to a specific vendor. Vendors see all their shops (any status), others see only enabled shops.'
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
      description: 'Field to sort by (id, name, status, createdAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of vendor shops with pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Tech Gadgets Shop' },
                description: { type: 'string', example: 'Selling the latest tech gadgets' },
                logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
                status: { type: 'string', example: 'enabled', enum: ['pending', 'enabled', 'disabled', 'rejected'] },
                createdAt: { type: 'string', format: 'date-time', example: '2025-01-15T10:30:00Z' },
                vendor: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 3 },
                    user: {
                      type: 'object',
                      properties: {
                        username: { type: 'string', example: 'vendor_user' },
                        email: { type: 'string', example: 'vendor@example.com' }
                      }
                    }
                  }
                },
                products: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 42 }
                    }
                  }
                }
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
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Vendor not found' })
  );
};

export const CheckPendingShopRequestSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Vendor Only] Check for pending shop request',
      description: 'Checks if the authenticated vendor has any pending shop requests'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Request check completed',
      schema: {
        oneOf: [
          {
            properties: {
              hasPendingRequest: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Pending shop request found' },
              requestDetails: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Tech Gadgets Shop' },
                  createdAt: { type: 'string', example: '2025-03-08T10:30:00Z' }
                }
              }
            }
          },
          {
            properties: {
              hasPendingRequest: { type: 'boolean', example: false },
              message: { type: 'string', example: 'No pending shop requests found' }
            }
          }
        ]
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - User is not a vendor' }),
  );
};

// Add this new swagger decorator
export const GetShopCitiesSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get shop delivery cities',
      description: 'Get the list of cities where a shop delivers to'
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: Number,
      description: 'Shop ID'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Cities retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'New York' },
            isActive: { type: 'boolean', example: true }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Shop not found' })
  );
};

export const GetShopsByCitySwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get shops available in a city',
      description: 'Get all shops that deliver to a specific city'
    }),
    ApiParam({
      name: 'cityId',
      required: true,
      type: Number,
      description: 'City ID'
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
      description: 'Field to sort by (id, name, createdAt)'
    }),
    ApiResponse({ 
      status: 200,
      description: 'Shops retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Tech Shop' },
                description: { type: 'string', example: 'Selling the latest tech gadgets' },
                logoUrl: { type: 'string', example: 'https://example.com/logo.png' },
                status: { type: 'string', example: 'enabled' },
                vendor: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 3 },
                    user: {
                      type: 'object', 
                      properties: {
                        username: { type: 'string', example: 'vendor_user' }
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
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'City not found or is inactive' })
  );
};