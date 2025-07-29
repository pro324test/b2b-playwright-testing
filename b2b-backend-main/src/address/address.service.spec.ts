import { Test, TestingModule } from '@nestjs/testing';
import { UserAddressService } from './user-address.service';
import { ShopAddressService } from './shop-address.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Address Services', () => {
  let userAddressService: UserAddressService;
  let shopAddressService: ShopAddressService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      userAddress: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      shopAddress: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      city: {
        findUnique: jest.fn(),
      },
      shop: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAddressService,
        ShopAddressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    userAddressService = module.get<UserAddressService>(UserAddressService);
    shopAddressService = module.get<ShopAddressService>(ShopAddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('UserAddressService should be defined', () => {
    expect(userAddressService).toBeDefined();
  });

  it('ShopAddressService should be defined', () => {
    expect(shopAddressService).toBeDefined();
  });

  // Example: test user address creation
  it('should create a user address', async () => {
    prisma.userAddress.count.mockResolvedValue(0);
    prisma.city.findUnique.mockResolvedValue({ id: 1, name: 'City' });
    prisma.userAddress.create.mockResolvedValue({ id: 1, street: '123 Main', city: { id: 1, name: 'City' } });

    const dto = { street: '123 Main', cityId: 1 };
    const result = await userAddressService.create(42, dto as any);

    expect(prisma.userAddress.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, street: '123 Main', city: { id: 1, name: 'City' } });
  });

  // Example: test shop address creation
  it('should create a shop address', async () => {
    prisma.shop.findUnique.mockResolvedValue({ id: 7, vendor: { userId: 42 } });
    prisma.city.findUnique.mockResolvedValue({ id: 1, name: 'City' });
    prisma.shopAddress.count.mockResolvedValue(0);
    prisma.shopAddress.create.mockResolvedValue({ id: 1, shopId: 7, street: 'Shop St', city: { id: 1, name: 'City' } });

    const dto = { shopId: 7, street: 'Shop St', cityId: 1 };
    const result = await shopAddressService.create(dto as any, 42);

    expect(prisma.shopAddress.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, shopId: 7, street: 'Shop St', city: { id: 1, name: 'City' } });
  });

  // Example: test user address deletion
  it('should delete a user address', async () => {
    prisma.userAddress.findFirst.mockResolvedValue({ id: 1, userId: 42 });
    prisma.userAddress.delete.mockResolvedValue(undefined);

    const result = await userAddressService.remove(1, 42);

    expect(prisma.userAddress.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ message: 'Address deleted successfully' });
  });

  // Example: test shop address deletion
  it('should delete a shop address', async () => {
    prisma.shopAddress.findFirst.mockResolvedValue({ id: 1, shopId: 7, shop: { vendor: { userId: 42 } } });
    prisma.shopAddress.delete.mockResolvedValue(undefined);

    const result = await shopAddressService.remove(1, 7, 42);

    expect(prisma.shopAddress.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ message: 'Shop address deleted successfully' });
  });
});