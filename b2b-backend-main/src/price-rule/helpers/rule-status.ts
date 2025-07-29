import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { findOne } from './core-operations';

/**
 * Permanently removes a price rule from the system
 * @param prisma The Prisma service instance
 * @param id The ID of the price rule to remove
 * @param currentUserId Optional ID of the current user requesting deletion
 * @param currentUserType Optional type of user ('admin' or 'user') requesting deletion
 * @param currentUserRole Optional role of the user ('admin', 'vendor', etc.)
 * @throws ForbiddenException if user doesn't have permission to delete this rule
 */
export async function remove(
  prisma: PrismaService, 
  id: number,
  currentUserId?: number,
  currentUserType?: string,
  currentUserRole?: string
): Promise<void> {
  // First verify the price rule exists
  const rule = await findOne(prisma, id);
  
  // Check permissions if user info is provided
  if (currentUserId && currentUserType) {
    // Permission check: allow if admin or if user is the creator
    const isAdmin = currentUserType === 'admin' || (currentUserRole && ['admin', 'superadmin'].includes(currentUserRole));
    const isOwner = currentUserType === rule.creatorType && currentUserId === rule.creatorId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to delete this price rule');
    }
  }
  
  // Then delete it
  await prisma.priceRule.delete({ 
    where: { id } 
  });
}

/**
 * Enables a previously disabled price rule
 * @param prisma The Prisma service instance
 * @param id The ID of the price rule to enable
 * @param currentUserId Optional ID of the current user requesting the change
 * @param currentUserType Optional type of user ('admin' or 'user') requesting the change
 * @param currentUserRole Optional role of the user ('admin', 'vendor', etc.)
 * @returns The updated price rule
 * @throws ForbiddenException if user doesn't have permission
 */
export async function enable(
  prisma: PrismaService, 
  id: number,
  currentUserId?: number,
  currentUserType?: string,
  currentUserRole?: string
) {
  // First verify the price rule exists
  const rule = await findOne(prisma, id);
  
  // Check permissions if user info is provided
  if (currentUserId && currentUserType) {
    // Permission check: allow if admin or if user is the creator
    const isAdmin = currentUserType === 'admin' || (currentUserRole && ['admin', 'superadmin'].includes(currentUserRole));
    const isOwner = currentUserType === rule.creatorType && currentUserId === rule.creatorId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to enable this price rule');
    }
  }
  
  return prisma.priceRule.update({
    where: { id },
    data: { status: 'enabled' }
  });
}

/**
 * Disables an active price rule
 * @param prisma The Prisma service instance
 * @param id The ID of the price rule to disable
 * @param currentUserId Optional ID of the current user requesting the change
 * @param currentUserType Optional type of user ('admin' or 'user') requesting the change
 * @param currentUserRole Optional role of the user ('admin', 'vendor', etc.)
 * @returns The updated price rule
 * @throws ForbiddenException if user doesn't have permission
 */
export async function disable(
  prisma: PrismaService, 
  id: number,
  currentUserId?: number,
  currentUserType?: string,
  currentUserRole?: string
) {
  // First verify the price rule exists
  const rule = await findOne(prisma, id);
  
  // Check permissions if user info is provided
  if (currentUserId && currentUserType) {
    // Permission check: allow if admin or if user is the creator
    const isAdmin = currentUserType === 'admin' || (currentUserRole && ['admin', 'superadmin'].includes(currentUserRole));
    const isOwner = currentUserType === rule.creatorType && currentUserId === rule.creatorId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to disable this price rule');
    }
  }
  
  return prisma.priceRule.update({
    where: { id },
    data: { status: 'disabled' }
  });
}