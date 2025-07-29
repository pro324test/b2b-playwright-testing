import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { UserAddressService } from './user-address.service';
import { ShopAddressService } from './shop-address.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AddressController', () => {
  let controller: AddressController;
  let userAddressService: UserAddressService;
  let shopAddressService: ShopAddressService;

  const mockUserAddressService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    setDefault: jest.fn(),
    remove: jest.fn(),
  };

  const mockShopAddressService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    setDefault: jest.fn(),
    remove: jest.fn(),
  };

  // Mock guards to always allow
  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };
  const mockRolesGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        { provide: UserAddressService, useValue: mockUserAddressService },
        { provide: ShopAddressService, useValue: mockShopAddressService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AddressController>(AddressController);
    userAddressService = module.get<UserAddressService>(UserAddressService);
    shopAddressService = module.get<ShopAddressService>(ShopAddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // User Address Endpoints

  it('should create a user address', async () => {
    const dto = { street: '123 Main', cityId: 1 };
    const req = { user: { userId: 42 } };
    mockUserAddressService.create.mockResolvedValue('created-address');
    const result = await controller.createUserAddress(dto as any, req as any);
    expect(userAddressService.create).toHaveBeenCalledWith(42, dto);
    expect(result).toBe('created-address');
  });

  it('should get all user addresses', async () => {
    const req = { user: { userId: 42 } };
    mockUserAddressService.findAll.mockResolvedValue(['address1', 'address2']);
    const result = await controller.getUserAddresses(req as any);
    expect(userAddressService.findAll).toHaveBeenCalledWith(42);
    expect(result).toEqual(['address1', 'address2']);
  });

  it('should get a specific user address', async () => {
    const req = { user: { userId: 42 } };
    mockUserAddressService.findOne.mockResolvedValue('address');
    const result = await controller.getUserAddress(5, req as any);
    expect(userAddressService.findOne).toHaveBeenCalledWith(5, 42);
    expect(result).toBe('address');
  });

  it('should update a user address', async () => {
    const req = { user: { userId: 42 } };
    const dto = { street: 'New St' };
    mockUserAddressService.update.mockResolvedValue('updated-address');
    const result = await controller.updateUserAddress(5, dto as any, req as any);
    expect(userAddressService.update).toHaveBeenCalledWith(5, 42, dto);
    expect(result).toBe('updated-address');
  });

  it('should set a user address as default', async () => {
    const req = { user: { userId: 42 } };
    mockUserAddressService.setDefault.mockResolvedValue('default-address');
    const result = await controller.setDefaultUserAddress(5, req as any);
    expect(userAddressService.setDefault).toHaveBeenCalledWith(5, 42);
    expect(result).toBe('default-address');
  });

  it('should remove a user address', async () => {
    const req = { user: { userId: 42 } };
    mockUserAddressService.remove.mockResolvedValue({ message: 'Address deleted successfully' });
    const result = await controller.removeUserAddress(5, req as any);
    expect(userAddressService.remove).toHaveBeenCalledWith(5, 42);
    expect(result).toEqual({ message: 'Address deleted successfully' });
  });

  // Shop Address Endpoints

  it('should create a shop address', async () => {
    const dto = { shopId: 7, street: 'Shop St', cityId: 1 };
    const req = { user: { userId: 42 } };
    mockShopAddressService.create.mockResolvedValue('created-shop-address');
    const result = await controller.createShopAddress(dto as any, req as any);
    expect(shopAddressService.create).toHaveBeenCalledWith(dto, 42);
    expect(result).toBe('created-shop-address');
  });

  it('should get all shop addresses', async () => {
    mockShopAddressService.findAll.mockResolvedValue(['shop-address1', 'shop-address2']);
    const result = await controller.getShopAddresses(7);
    expect(shopAddressService.findAll).toHaveBeenCalledWith(7);
    expect(result).toEqual(['shop-address1', 'shop-address2']);
  });

  it('should get a specific shop address', async () => {
    mockShopAddressService.findOne.mockResolvedValue('shop-address');
    const result = await controller.getShopAddress(7, 8);
    expect(shopAddressService.findOne).toHaveBeenCalledWith(8, 7);
    expect(result).toBe('shop-address');
  });

  it('should update a shop address', async () => {
    const req = { user: { userId: 42 } };
    const dto = { street: 'Updated Shop St' };
    mockShopAddressService.update.mockResolvedValue('updated-shop-address');
    // shopId is passed in the body in your controller
    const result = await controller.updateShopAddress(8, dto as any, 7, req as any);
    expect(shopAddressService.update).toHaveBeenCalledWith(8, 7, dto, 42);
    expect(result).toBe('updated-shop-address');
  });

  it('should set a shop address as default', async () => {
    const req = { user: { userId: 42 } };
    mockShopAddressService.setDefault.mockResolvedValue('default-shop-address');
    const result = await controller.setDefaultShopAddress(8, 7, req as any);
    expect(shopAddressService.setDefault).toHaveBeenCalledWith(8, 7, 42);
    expect(result).toBe('default-shop-address');
  });

  it('should remove a shop address', async () => {
    const req = { user: { userId: 42 } };
    mockShopAddressService.remove.mockResolvedValue({ message: 'Shop address deleted successfully' });
    const result = await controller.removeShopAddress(8, 7, req as any);
    expect(shopAddressService.remove).toHaveBeenCalledWith(8, 7, 42);
    expect(result).toEqual({ message: 'Shop address deleted successfully' });
  });
});