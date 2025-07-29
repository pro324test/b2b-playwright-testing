import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Process a payment during checkout
   */
  async processPayment(
    orderId: number,
    paymentMethod: string,
    amount: number,
    transactionId?: string,
  ) {
    // Find the order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Create payment based on method
    if (paymentMethod === 'moamalat') {
      if (!transactionId) {
        throw new BadRequestException('Transaction ID is required for Moamalat payments');
      }
      
      // Create completed payment record for Moamalat
      await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          paymentMethod,
          transactionId,
          status: 'completed',
          completedAt: new Date(),
        },
      });
      
      // Update order to paid status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          paidAmount: amount
        }
      });
      
      return { paymentStatus: 'paid' };
    } 
    else if (paymentMethod === 'cod') {
      // Create pending payment for COD
      await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          paymentMethod,
          status: 'pending',
        },
      });
      
      // Keep order as unpaid
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'unpaid',
          paidAmount: 0
        }
      });
      
      return { paymentStatus: 'unpaid' };
    }
    
    throw new BadRequestException('Invalid payment method');
  }
}