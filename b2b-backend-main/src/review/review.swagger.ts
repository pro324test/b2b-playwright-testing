// src/review/review.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { CreateProductReviewDto } from './dto/product-review.dto';
import { CreateShopReviewDto } from './dto/shop-review.dto';
import { UpdateReviewSettingsDto } from './dto/review-settings.dto';
import { SortDirection } from '../common/dto/pagination.dto';

// ========================
// Product Review Decorators
// ========================

export const CreateProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Create product review',
      description: 'Create a new review for a product you purchased. You can upload up to 10 images.'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          productId: { type: 'integer', example: 5 },
          rating: { type: 'integer', example: 4 },
          title: { type: 'string', example: 'Great product!' },
          content: { type: 'string', example: 'This product exceeded my expectations...' },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Review images (up to 10)'
          }
        },
        required: ['productId']
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Review created successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          productId: { type: 'number', example: 5 },
          userId: { type: 'number', example: 3 },
          rating: { type: 'number', example: 4 },
          title: { type: 'string', example: 'Great product!' },
          content: { type: 'string', example: 'This product exceeded my expectations...' },
          status: { type: 'string', example: 'approved' },
          isVerifiedPurchase: { type: 'boolean', example: true },
          helpfulVotes: { type: 'number', example: 0 },
          mediaUrls: { 
            type: 'array', 
            items: { type: 'string' }, 
            example: ['/uploads/reviews/review-1633455678-123456789.jpg'] 
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 3 },
              username: { type: 'string', example: 'johndoe' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Invalid input or validation error' }),
    ApiResponse({ status: 404, description: 'Product not found' }),
    ApiResponse({ 
      status: 403, 
      description: 'Purchase verification required',
      schema: {
        example: {
          statusCode: 403,
          message: 'You must purchase this product before reviewing it',
          error: 'Forbidden'
        }
      }
    })
  );
};

export const GetProductReviewsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get product reviews',
      description: 'Get all approved reviews for a specific product with pagination'
    }),
    ApiParam({
      name: 'productId',
      type: 'number',
      description: 'Product ID',
      required: true
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
    ApiResponse({
      status: 200,
      description: 'Reviews retrieved successfully',
      schema: {
        properties: {
          reviews: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                rating: { type: 'number', example: 4 },
                title: { type: 'string', example: 'Great product!' },
                content: { type: 'string', example: 'This product exceeded my expectations...' },
                isVerifiedPurchase: { type: 'boolean', example: true },
                helpfulVotes: { type: 'number', example: 5 },
                createdAt: { type: 'string', format: 'date-time' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    username: { type: 'string' }
                  }
                },
                replies: {
                  type: 'array',
                  items: {
                    type: 'object'
                  }
                }
              }
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalCount: { type: 'number', example: 42 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 5 },
              avgRating: { type: 'number', example: 4.2 },
              ratingCount: { type: 'number', example: 35 },
              distribution: {
                type: 'object',
                properties: {
                  '5': { type: 'number', example: 20 },
                  '4': { type: 'number', example: 10 },
                  '3': { type: 'number', example: 3 },
                  '2': { type: 'number', example: 1 },
                  '1': { type: 'number', example: 1 }
                }
              }
            }
          }
        }
      }
    })
  );
};

export const GetProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get single product review',
      description: 'Retrieve a specific product review by ID'
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review retrieved successfully'
    }),
    ApiResponse({ status: 404, description: 'Review not found or not accessible' })
  );
};

export const UpdateProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Update product review',
      description: 'Update your own product review content and manage images. You can add new images and delete existing ones by ID.'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          content: { 
            type: 'string', 
            example: 'Updated review text here...' 
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'New review images to add (up to 10)'
          },
          deleteImageIds: { 
            type: 'string', 
            example: '[1, 3, 5]',
            description: 'JSON string array of image IDs to delete' 
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Review updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          content: { type: 'string', example: 'Updated review text here...' },
          status: { type: 'string', example: 'pending' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 3 },
              username: { type: 'string', example: 'johndoe' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Validation failed or media uploads not enabled' }),
    ApiResponse({ status: 403, description: 'Not the author of this review' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const MarkProductReviewHelpfulSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Mark review as helpful',
      description: 'Mark a product review as helpful'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review marked as helpful',
      schema: {
        properties: {
          helpfulVotes: { type: 'number', example: 6 }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const ReplyToProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Reply to review',
      description: 'Add a reply to a product review (vendor, admin, or original reviewer)'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', example: 'Thank you for your feedback!' }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Reply added successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 5 },
          content: { type: 'string', example: 'Thank you for your feedback!' },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              username: { type: 'string', example: 'vendor_user' },
              role: { type: 'string', example: 'vendor' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Not allowed to reply to this review' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const DeleteProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Delete review',
      description: 'Delete your own product review'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review deleted successfully',
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Review deleted successfully' }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Not authorized to delete this review' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

// =====================
// Shop Review Decorators
// =====================

export const CreateShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Create shop review',
      description: 'Create a new review for a shop you purchased from. You can upload up to 10 images.'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          shopId: { type: 'integer', example: 3 },
          rating: { type: 'integer', example: 5 },
          title: { type: 'string', example: 'Excellent shop!' },
          content: { type: 'string', example: 'Great selection and fast shipping...' },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Review images (up to 10)'
          }
        },
        required: ['shopId']
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Shop review created successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          shopId: { type: 'number', example: 3 },
          userId: { type: 'number', example: 5 },
          rating: { type: 'number', example: 5 },
          title: { type: 'string', example: 'Excellent shop!' },
          content: { type: 'string', example: 'Great selection and fast shipping...' },
          status: { type: 'string', example: 'approved' },
          isVerifiedPurchase: { type: 'boolean', example: true },
          helpfulVotes: { type: 'number', example: 0 },
          mediaUrls: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['/uploads/reviews/review-1633455678-123456789.jpg']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              username: { type: 'string', example: 'johndoe' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Invalid input or validation error' }),
    ApiResponse({ status: 404, description: 'Shop not found' }),
    ApiResponse({ 
      status: 403, 
      description: 'Purchase verification required',
      schema: {
        example: {
          statusCode: 403,
          message: 'You must make a purchase from this shop before reviewing it',
          error: 'Forbidden'
        }
      }
    })
  );
};

export const GetShopReviewsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get shop reviews',
      description: 'Get all approved reviews for a specific shop with pagination'
    }),
    ApiParam({
      name: 'shopId',
      type: 'number',
      description: 'Shop ID',
      required: true
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
    ApiResponse({
      status: 200,
      description: 'Shop reviews retrieved successfully',
      schema: {
        properties: {
          reviews: {
            type: 'array',
            items: {
              type: 'object'
            }
          },
          meta: {
            type: 'object',
            properties: {
              totalCount: { type: 'number', example: 42 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 5 },
              avgRating: { type: 'number', example: 4.5 },
              ratingCount: { type: 'number', example: 38 },
              distribution: {
                type: 'object',
                properties: {
                  '5': { type: 'number', example: 25 },
                  '4': { type: 'number', example: 9 },
                  '3': { type: 'number', example: 2 },
                  '2': { type: 'number', example: 1 },
                  '1': { type: 'number', example: 1 }
                }
              }
            }
          }
        }
      }
    })
  );
};

export const GetShopReviewStatsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Public] Get shop review statistics',
      description: 'Get aggregated statistics for shop reviews'
    }),
    ApiParam({
      name: 'shopId',
      type: 'number',
      description: 'Shop ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Shop review statistics retrieved successfully',
      schema: {
        properties: {
          shopId: { type: 'number', example: 3 },
          totalReviews: { type: 'number', example: 38 },
          avgRating: { type: 'number', example: 4.5 },
          distribution: {
            type: 'object',
            properties: {
              '5': { type: 'number', example: 25 },
              '4': { type: 'number', example: 9 },
              '3': { type: 'number', example: 2 },
              '2': { type: 'number', example: 1 },
              '1': { type: 'number', example: 1 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Shop not found' })
  );
};

export const GetShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get single shop review',
      description: 'Retrieve a specific shop review by ID'
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review retrieved successfully'
    }),
    ApiResponse({ status: 404, description: 'Review not found or not accessible' })
  );
};

export const UpdateShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Update shop review',
      description: 'Update your own shop review content and manage images. You can add new images and delete existing ones by ID.'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          content: { 
            type: 'string', 
            example: 'Updated shop review text here...' 
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'New review images to add (up to 10)'
          },
          deleteImageIds: { 
            type: 'string', 
            example: '[1, 3, 5]',
            description: 'JSON string array of image IDs to delete' 
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Review updated successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          content: { type: 'string', example: 'Updated shop review text here...' },
          status: { type: 'string', example: 'pending' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 3 },
              username: { type: 'string', example: 'johndoe' }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Validation failed or media uploads not enabled' }),
    ApiResponse({ status: 403, description: 'Not the author of this review' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const MarkShopReviewHelpfulSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Mark shop review as helpful',
      description: 'Mark a shop review as helpful'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review marked as helpful',
      schema: {
        properties: {
          helpfulVotes: { type: 'number', example: 6 }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const ReplyToShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Reply to shop review',
      description: 'Add a reply to a shop review (vendor, admin, or original reviewer)'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', example: 'Thank you for shopping with us!' }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Reply added successfully'
    }),
    ApiResponse({ status: 403, description: 'Not allowed to reply to this review' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const DeleteShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Authenticated] Delete shop review',
      description: 'Delete your own shop review'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review deleted successfully',
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Shop review deleted successfully' }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Not authorized to delete this review' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

// ========================
// Admin Review Decorators
// ========================

export const GetReviewSettingsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get review settings',
      description: 'Get the current platform-wide review settings'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Settings retrieved successfully',
      schema: {
        properties: {
          id: { type: 'number', example: 1 },
          requirePurchaseVerification: { type: 'boolean', example: false },
          showVerificationBadge: { type: 'boolean', example: true },
          requireRating: { type: 'boolean', example: true },
          requireText: { type: 'boolean', example: false },
          moderationEnabled: { type: 'boolean', example: false },
          maxImagesPerReview: { type: 'number', example: 3 },
          defaultStatus: { type: 'string', example: 'approved' },
          autoApproveVerifiedOnly: { type: 'boolean', example: false },
          moderateNegativeOnly: { type: 'boolean', example: false },
          negativeBelowRating: { type: 'number', example: 2 },
          mediaEnabled: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const UpdateReviewSettingsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update review settings',
      description: 'Update the platform-wide review settings'
    }),
    ApiBearerAuth(),
    ApiBody({ type: UpdateReviewSettingsDto }),
    ApiResponse({
      status: 200,
      description: 'Settings updated successfully'
    }),
    ApiResponse({ status: 400, description: 'Invalid input' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetPendingReviewsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get pending reviews',
      description: 'Get all reviews pending moderation'
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
      name: 'type',
      required: false,
      enum: ['product', 'shop'],
      description: 'Type of reviews to fetch (product or shop)'
    }),
    ApiResponse({
      status: 200,
      description: 'Pending reviews retrieved successfully',
      schema: {
        properties: {
          reviews: {
            type: 'object',
            properties: {
              productReviews: { type: 'array', items: { type: 'object' } },
              shopReviews: { type: 'array', items: { type: 'object' } },
            }
          },
          meta: {
            type: 'object',
            properties: {
              productReviews: {
                type: 'object',
                properties: {
                  totalCount: { type: 'number', example: 5 },
                  totalPages: { type: 'number', example: 1 },
                }
              },
              shopReviews: {
                type: 'object',
                properties: {
                  totalCount: { type: 'number', example: 3 },
                  totalPages: { type: 'number', example: 1 },
                }
              },
              totalReviews: { type: 'number', example: 8 }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetReviewStatisticsSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Get review statistics',
      description: 'Get comprehensive statistics about reviews across the platform'
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Review statistics retrieved successfully',
      schema: {
        properties: {
          totalReviews: { type: 'number', example: 156 },
          productReviews: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 95 },
              pending: { type: 'number', example: 4 },
              approved: { type: 'number', example: 88 },
              rejected: { type: 'number', example: 3 },
              averageRating: { type: 'number', example: 4.2 },
              ratingDistribution: {
                type: 'object',
                properties: {
                  '5': { type: 'number', example: 45 },
                  '4': { type: 'number', example: 30 },
                  '3': { type: 'number', example: 8 },
                  '2': { type: 'number', example: 3 },
                  '1': { type: 'number', example: 2 }
                }
              }
            }
          },
          shopReviews: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 61 },
              pending: { type: 'number', example: 2 },
              approved: { type: 'number', example: 57 },
              rejected: { type: 'number', example: 2 },
              averageRating: { type: 'number', example: 4.5 },
              ratingDistribution: {
                type: 'object',
                properties: {
                  '5': { type: 'number', example: 38 },
                  '4': { type: 'number', example: 15 },
                  '3': { type: 'number', example: 3 },
                  '2': { type: 'number', example: 0 },
                  '1': { type: 'number', example: 1 }
                }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const ApproveProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Approve product review',
      description: 'Approve a pending product review'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review approved successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const ApproveShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Approve shop review',
      description: 'Approve a pending shop review'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review approved successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const RejectProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Reject product review',
      description: 'Reject a pending product review'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review rejected successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const RejectShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Reject shop review',
      description: 'Reject a pending shop review'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review rejected successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const AdminDeleteProductReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete product review',
      description: 'Permanently delete a product review (admin action)'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review deleted successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};

export const AdminDeleteShopReviewSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete shop review',
      description: 'Permanently delete a shop review (admin action)'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Review ID',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Review deleted successfully'
    }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Review not found' })
  );
};