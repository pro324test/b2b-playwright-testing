import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { RequestVendorDto } from './dto/request-vendor.dto';
import { RespondVendorRequestDto } from './dto/respond-vendor-request.dto';
import { CreateVendorGroupDto } from './dto/create-vendor-group.dto';
import { UpdateVendorGroupDto } from './dto/update-vendor-group.dto';
import { SortDirection } from '../common/dto/pagination.dto';

export const RequestVendorSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[User Only] Request to become a vendor',
      description: 'Regular users can submit a request to become vendors. Admin users cannot become vendors. Users can optionally specify which vendor group they wish to join.'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: RequestVendorDto,
      examples: {
        withGroup: {
          summary: 'Request with vendor group preference',
          value: {
            message: 'I would like to sell electronics products on your platform.',
            vendorGroupId: 1
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Vendor request submitted successfully',
      schema: {
        example: {
          message: 'Vendor request submitted'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Already a vendor or has pending request',
      schema: {
        example: {
          statusCode: 400,
          message: 'You already have a pending vendor request',
          error: 'Bad Request'
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - User not authenticated'
    })
  );
};

export const RequestVendorWithDocumentsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Submit a vendor request with business documents',
      description: 'User requests to become a vendor with business name and required documentation',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        required: ['businessName', 'practicePermitDoc', 'licenseDoc'],
        properties: {
          businessName: { 
            type: 'string',
            example: 'Tech Solutions LLC',
            description: 'Business name of the vendor'
          },
          practicePermitDoc: { 
            type: 'string',
            format: 'binary',
            description: 'Practice permit document file (PDF, JPG, PNG, etc.)'
          },
          licenseDoc: { 
            type: 'string',
            format: 'binary',
            description: 'Business license document file (PDF, JPG, PNG, etc.)'
          },
          message: { 
            type: 'string',
            example: 'I would like to become a vendor to sell electronics products.'
          },
          requestedGroupId: { 
            type: 'string',
            example: '1',
            description: 'ID of the vendor group to join'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Request submitted successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Vendor request submitted successfully' },
          status: { type: 'string', example: 'pending' }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad Request - Missing required files or fields' }),
    ApiResponse({ status: 409, description: 'User is already a vendor or has pending request' }),
  );
};

export const UpdateVendorProfileSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update vendor profile information',
      description: 'Update business name and business documents',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          businessName: { 
            type: 'string',
            example: 'Updated Business Name LLC',
            description: 'Business name of the vendor'
          },
          practicePermitDoc: { 
            type: 'string',
            format: 'binary',
            description: 'Practice permit document file (PDF, JPG, PNG, etc.)'
          },
          licenseDoc: { 
            type: 'string',
            format: 'binary',
            description: 'Business license document file (PDF, JPG, PNG, etc.)'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Profile updated successfully',
      schema: {
        properties: {
          message: { type: 'string', example: 'Vendor profile updated successfully' },
          vendor: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              businessName: { type: 'string', example: 'Updated Business Name LLC' },
              practicePermitDoc: { type: 'string', example: 'https://example.com/uploads/vendor-documents/file1.pdf' },
              licenseDoc: { type: 'string', example: 'https://example.com/uploads/vendor-documents/file2.pdf' },
              isDisabled: { type: 'boolean', example: false }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 404, description: 'Vendor profile not found' }),
  );
};

export const RespondVendorRequestSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Respond to vendor request',
      description: 'Accept or reject a vendor request. Accepting converts the user to vendor role automatically.'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: RespondVendorRequestDto,
      examples: {
        accept: {
          summary: 'Accept vendor request',
          value: {
            status: 'accept'
          }
        },
        reject: {
          summary: 'Reject vendor request',
          value: {
            status: 'reject'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor request processed successfully',
      schema: {
        example: {
          message: 'Vendor request accept'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request - Request already processed or invalid status',
      schema: {
        example: {
          statusCode: 400,
          message: 'This request has already been processed',
          error: 'Bad Request'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor request not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor request not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetAllVendorRequestsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all vendor requests',
      description: 'View all vendor requests including pending, accepted and rejected ones'
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
      description: 'Field to sort by (id, status, createdAt, respondedAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'List of vendor requests with pagination',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                status: { type: 'string', enum: ['pending', 'accept', 'reject'], example: 'pending' },
                message: { type: 'string', example: 'I would like to sell electronics products' },
                requestedGroupId: { type: 'number', example: 1, nullable: true },
                createdAt: { type: 'string', format: 'date-time', example: '2025-02-15T10:30:00Z' },
                respondedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 5 },
                    username: { type: 'string', example: 'john_seller' },
                    email: { type: 'string', example: 'john@example.com' },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Smith' }
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

export const EnableVendorSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Enable a vendor',
      description: 'Enable a previously disabled vendor account. This will also enable all their shops.'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor enabled successfully',
      schema: {
        example: {
          message: 'Vendor enabled successfully'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DisableVendorSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Disable a vendor',
      description: 'Temporarily disable a vendor account. This will also disable all their shops.'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor disabled successfully',
      schema: {
        example: {
          message: 'Vendor disabled successfully'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetAllVendorsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get all vendors',
      description: 'View paginated list of all vendors with their status and shops'
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
      description: 'Field to sort by (id, isDisabled, createdAt, updatedAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Paginated list of vendors',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                isDisabled: { type: 'boolean', example: false },
                createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-01-10T14:30:00Z' },
                userId: { type: 'number', example: 5 },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 5 },
                    username: { type: 'string', example: 'vendor_user' },
                    email: { type: 'string', example: 'vendor@example.com' },
                    firstName: { type: 'string', example: 'Jane' },
                    lastName: { type: 'string', example: 'Doe' },
                    role: { type: 'string', example: 'vendor' }
                  }
                },
                shops: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 3 },
                      name: { type: 'string', example: 'Tech Shop' },
                      description: { type: 'string', example: 'Selling the latest tech gadgets' },
                      status: { type: 'string', example: 'enabled', enum: ['pending', 'enabled', 'disabled', 'rejected'] },
                      createdAt: { type: 'string', format: 'date-time', example: '2025-01-05T09:15:00Z' }
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
              sortBy: { type: 'string', example: 'createdAt' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetVendorSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get specific vendor details',
      description: 'Get detailed information about a specific vendor'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor details retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          isDisabled: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T12:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-01-10T14:30:00Z' },
          userId: { type: 'number', example: 5 },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              username: { type: 'string', example: 'vendor_user' },
              email: { type: 'string', example: 'vendor@example.com' },
              firstName: { type: 'string', example: 'Jane' },
              lastName: { type: 'string', example: 'Doe' },
              role: { type: 'string', example: 'vendor' }
            }
          },
          shops: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 3 },
                name: { type: 'string', example: 'Tech Shop' },
                description: { type: 'string', example: 'Selling the latest tech gadgets' },
                status: { type: 'string', example: 'enabled' }
              }
            }
          },
          groups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Premium Vendors' }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const CreateVendorGroupSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create vendor group',
      description: 'Create a new group for organizing vendors'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateVendorGroupDto,
      examples: {
        basic: {
          summary: 'Create vendor group',
          value: {
            name: 'Premium Vendors',
            description: 'Top performing vendors with special privileges'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Vendor group created successfully',
      schema: {
        example: {
          id: 1,
          name: 'Premium Vendors',
          description: 'Top performing vendors with special privileges',
          createdAt: '2025-02-15T12:00:00Z',
          updatedAt: '2025-02-15T12:00:00Z'
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 409, 
      description: 'Group name already exists',
      schema: {
        example: {
          statusCode: 409,
          message: 'Group name already exists',
          error: 'Conflict'
        }
      }
    })
  );
};

export const UpdateVendorGroupSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update vendor group',
      description: 'Update group details and member vendors'
    }),
    ApiBearerAuth(),
    ApiBody({
      type: UpdateVendorGroupDto,
      examples: {
        updateName: {
          summary: 'Update group name and description',
          value: {
            name: 'Elite Vendors',
            description: 'Our most trusted vendor partners'
          }
        },
        updateMembers: {
          summary: 'Update member vendors',
          value: {
            vendorIds: [1, 2, 5]
          }
        },
        fullUpdate: {
          summary: 'Full update',
          value: {
            name: 'Elite Vendors',
            description: 'Our most trusted vendor partners',
            vendorIds: [1, 2, 5]
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor group updated successfully',
      schema: {
        example: {
          id: 1,
          name: 'Elite Vendors',
          description: 'Our most trusted vendor partners',
          createdAt: '2025-02-15T12:00:00Z',
          updatedAt: '2025-02-16T09:30:00Z',
          vendors: [
            {
              id: 1,
              user: {
                username: 'vendor1',
                email: 'vendor1@example.com'
              }
            },
            {
              id: 2,
              user: {
                username: 'vendor2',
                email: 'vendor2@example.com'
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor group not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor group with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetVendorGroupSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get specific vendor group details',
      description: 'Get detailed information about a specific vendor group'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor group details retrieved successfully',
      schema: {
        example: {
          id: 1,
          name: 'Premium Vendors',
          description: 'Top performing vendors with special privileges',
          createdAt: '2025-02-15T12:00:00Z',
          updatedAt: '2025-02-15T12:00:00Z',
          vendors: [
            {
              id: 1,
              isDisabled: false,
              user: {
                username: 'vendor1',
                email: 'vendor1@example.com'
              },
              shops: [
                {
                  id: 3,
                  name: 'Tech Shop'
                }
              ]
            }
          ],
          priceRules: [
            {
              id: 2,
              name: 'Premium Vendor Discount',
              discountType: 'percentage',
              discountValue: 5
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor group not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor group with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const GetAllVendorGroupsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get all vendor groups',
      description: 'Get paginated list of all vendor groups with their members'
    }),
    //ApiBearerAuth(),
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
      description: 'Field to sort by (id, name, createdAt, updatedAt)'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Paginated list of vendor groups',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Premium Vendors' },
                description: { type: 'string', example: 'Top performing vendors with special privileges' },
                createdAt: { type: 'string', format: 'date-time', example: '2025-02-15T12:00:00Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-02-15T12:00:00Z' },
                vendors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', example: 1 },
                      user: {
                        type: 'object',
                        properties: {
                          username: { type: 'string', example: 'vendor1' },
                          email: { type: 'string', example: 'vendor1@example.com' }
                        }
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
              totalItems: { type: 'number', example: 5 },
              itemsPerPage: { type: 'number', example: 10 },
              currentPage: { type: 'number', example: 1 },
              totalPages: { type: 'number', example: 1 },
              hasNextPage: { type: 'boolean', example: false },
              hasPreviousPage: { type: 'boolean', example: false },
              sortBy: { type: 'string', example: 'name' },
              sortDirection: { type: 'string', example: 'asc' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const DeleteVendorGroupSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete vendor group',
      description: 'Delete a vendor group that has no price rules attached'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor group deleted successfully',
      schema: {
        example: {
          message: 'Vendor group deleted successfully'
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Admin access required or group has active price rules',
      schema: {
        example: {
          statusCode: 403,
          message: 'Cannot delete vendor group that has active price rules',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor group not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor group with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const DeleteVendorSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[SuperAdmin Only] Delete vendor',
      description: 'Permanently delete a vendor account with all shops (only if no products exist)'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor deleted successfully',
      schema: {
        example: {
          message: 'Vendor deleted successfully'
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - SuperAdmin access required or vendor has active products',
      schema: {
        example: {
          statusCode: 403,
          message: 'Cannot delete vendor with active products. Disable the vendor instead.',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UpdateVendorSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update vendor',
      description: 'Update vendor information and status'
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          isDisabled: { type: 'boolean', example: false }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor updated successfully',
      schema: {
        example: {
          id: 1,
          isDisabled: false,
          userId: 5,
          createdAt: '2025-01-01T12:00:00Z',
          updatedAt: '2025-02-20T15:45:00Z',
          user: {
            username: 'vendor_user',
            email: 'vendor@example.com'
          },
          shops: [
            {
              id: 3,
              name: 'Tech Shop',
              status: 'enabled'
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor with ID 999 not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const UpdateVendorRequestSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Update vendor request',
      description: 'Users can update message on their pending requests. Admins can update status.'
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          message: { 
            type: 'string', 
            example: 'I would like to sell electronics and home appliances' 
          },
          status: { 
            type: 'string', 
            enum: ['pending', 'accept', 'reject'],
            example: 'pending'
          }
        }
      },
      examples: {
        updateMessage: {
          summary: 'User updating request message',
          value: {
            message: 'I would like to sell electronics and home appliances'
          }
        },
        adminUpdateStatus: {
          summary: 'Admin updating request status',
          value: {
            status: 'accept'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Vendor request updated successfully',
      schema: {
        example: {
          id: 1,
          status: 'pending',
          message: 'I would like to sell electronics and home appliances',
          createdAt: '2025-02-15T12:00:00Z',
          userId: 5,
          respondedAt: null,
          user: {
            username: 'user123',
            email: 'user@example.com'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Not your request or admin',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can only update your own vendor requests',
          error: 'Forbidden'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Bad request - Already processed',
      schema: {
        example: {
          statusCode: 400,
          message: 'Cannot update message for a request that is already processed',
          error: 'Bad Request'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor request not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor request not found',
          error: 'Not Found'
        }
      }
    })
  );
};

export const ManageVendorsInGroupSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Manage vendors in group',
      description: 'Add, remove, or replace vendors in a group'
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        required: ['operation', 'vendorIds'],
        properties: {
          operation: { 
            type: 'string', 
            enum: ['add', 'remove', 'set'],
            example: 'add',
            description: 'Operation type: add (add vendors), remove (remove vendors), set (replace all)'
          },
          vendorIds: {
            type: 'array',
            items: { type: 'number' },
            example: [1, 2, 3],
            description: 'IDs of vendors to add, remove, or set as the complete list'
          }
        }
      },
      examples: {
        add: {
          summary: 'Add vendors to group',
          value: {
            operation: 'add',
            vendorIds: [1, 2]
          }
        },
        remove: {
          summary: 'Remove vendors from group',
          value: {
            operation: 'remove',
            vendorIds: [3]
          }
        },
        set: {
          summary: 'Replace all vendors in group',
          value: {
            operation: 'set',
            vendorIds: [1, 4, 5]
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Vendors in group updated successfully',
      schema: {
        example: {
          id: 1,
          name: 'Premium Vendors',
          description: 'Top performing vendors',
          vendors: [
            {
              id: 1,
              user: {
                username: 'vendor1',
                email: 'vendor1@example.com'
              },
              shops: [
                { id: 3, name: 'Tech Shop' }
              ]
            },
            {
              id: 4,
              user: {
                username: 'vendor4',
                email: 'vendor4@example.com'
              },
              shops: [
                { id: 7, name: 'Fashion Store' }
              ]
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ 
      status: 404, 
      description: 'Vendor group not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Vendor group with ID 999 not found',
          error: 'Not Found'
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid vendor IDs',
      schema: {
        example: {
          statusCode: 400,
          message: 'One or more vendor IDs do not exist',
          error: 'Bad Request'
        }
      }
    })
  );
};

export const CheckVendorRequestSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Check if user has vendor request',
      description: 'Returns information about the current user\'s vendor request status'
    }),
    ApiBearerAuth(),
    ApiResponse({ 
      status: 200, 
      description: 'Request status checked successfully',
      schema: {
        example: {
          hasRequest: true,
          status: 'pending',
          createdAt: '2025-03-05T10:30:00Z',
          message: 'I would like to become a vendor to sell electronics.',
          requestedGroupId: 1
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - User not authenticated'
    })
  );
};

