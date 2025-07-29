import { Test, TestingModule } from '@nestjs/testing';
import { PriceRuleService } from './price-rule.service';
import { PrismaService } from '../prisma/prisma.service';
import * as CoreOperations from './helpers/core-operations';
import * as ProductRules from './helpers/product-rules';
import * as RuleStatus from './helpers/rule-status';
import * as VendorRules from './helpers/vendor-rules';

describe('PriceRuleService', () => {
  let service: PriceRuleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceRuleService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PriceRuleService>(PriceRuleService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock all helper functions
    jest.spyOn(CoreOperations, 'create').mockResolvedValue('created-rule' as any);
    jest.spyOn(CoreOperations, 'findOne').mockResolvedValue('found-rule' as any);
    jest.spyOn(CoreOperations, 'update').mockResolvedValue('updated-rule' as any);
    jest.spyOn(RuleStatus, 'remove').mockResolvedValue(undefined);
    jest.spyOn(RuleStatus, 'enable').mockResolvedValue('enabled-rule' as any);
    jest.spyOn(RuleStatus, 'disable').mockResolvedValue('disabled-rule' as any);
    jest.spyOn(ProductRules, 'findActiveRulesForProduct').mockResolvedValue('product-rules' as any);
    jest.spyOn(ProductRules, 'findActiveRulesForVariant').mockResolvedValue('variant-rules' as any);
    jest.spyOn(VendorRules, 'findActiveRulesForVendorGroup').mockResolvedValue('vendor-group-rules' as any);
    jest.spyOn(VendorRules, 'findActiveRulesForVendor').mockResolvedValue('vendor-rules' as any);
    jest.spyOn(VendorRules, 'findActiveRulesForShop').mockResolvedValue('shop-rules' as any);
    jest.spyOn(VendorRules, 'findMyRules').mockResolvedValue('my-rules' as any);
    jest.spyOn(VendorRules, 'findAll').mockResolvedValue('all-rules' as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a price rule', async () => {
    const dto = { name: 'Test Rule' } as any;
    const result = await service.create(dto, 1, 'admin', 2);
    expect(CoreOperations.create).toHaveBeenCalledWith(prisma, dto, 1, 'admin', 2);
    expect(result).toBe('created-rule');
  });

  it('should find a price rule by id', async () => {
    const result = await service.findOne(123);
    expect(CoreOperations.findOne).toHaveBeenCalledWith(prisma, 123);
    expect(result).toBe('found-rule');
  });

  it('should update a price rule', async () => {
    const dto = { name: 'Updated Rule' } as any;
    const result = await service.update(123, dto, 1, 'admin', 'admin', 2);
    expect(CoreOperations.update).toHaveBeenCalledWith(prisma, 123, dto, 1, 'admin', 'admin', 2);
    expect(result).toBe('updated-rule');
  });

  it('should remove a price rule', async () => {
    await service.remove(123, 1, 'admin', 'admin');
    expect(RuleStatus.remove).toHaveBeenCalledWith(prisma, 123, 1, 'admin', 'admin');
  });

  it('should enable a price rule', async () => {
    const result = await service.enable(123, 1, 'admin', 'admin');
    expect(RuleStatus.enable).toHaveBeenCalledWith(prisma, 123, 1, 'admin', 'admin');
    expect(result).toBe('enabled-rule');
  });

  it('should disable a price rule', async () => {
    const result = await service.disable(123, 1, 'admin', 'admin');
    expect(RuleStatus.disable).toHaveBeenCalledWith(prisma, 123, 1, 'admin', 'admin');
    expect(result).toBe('disabled-rule');
  });

  it('should find all price rules', async () => {
    const result = await service.findAll(false, {}, 1, 'admin', 'admin');
    expect(VendorRules.findAll).toHaveBeenCalledWith(prisma, false, {}, 1, 'admin', 'admin');
    expect(result).toBe('all-rules');
  });

  it('should find active rules for product', async () => {
    const result = await service.findActiveRulesForProduct(1, {}, 1, 'admin', 'admin');
    expect(ProductRules.findActiveRulesForProduct).toHaveBeenCalledWith(prisma, 1, {}, 1, 'admin', 'admin');
    expect(result).toBe('product-rules');
  });

  it('should find active rules for variant', async () => {
    const result = await service.findActiveRulesForVariant(1, {}, 1, 'admin', 'admin');
    expect(ProductRules.findActiveRulesForVariant).toHaveBeenCalledWith(prisma, 1, {}, 1, 'admin', 'admin');
    expect(result).toBe('variant-rules');
  });

  it('should find active rules for vendor group', async () => {
    const result = await service.findActiveRulesForVendorGroup(1, {}, 1, 'admin', 'admin');
    expect(VendorRules.findActiveRulesForVendorGroup).toHaveBeenCalledWith(prisma, 1, {}, 1, 'admin', 'admin');
    expect(result).toBe('vendor-group-rules');
  });

  it('should find active rules for vendor', async () => {
    const result = await service.findActiveRulesForVendor(1, {}, 1, 'admin', 'admin');
    expect(VendorRules.findActiveRulesForVendor).toHaveBeenCalledWith(prisma, 1, {}, 1, 'admin', 'admin');
    expect(result).toBe('vendor-rules');
  });

  it('should find active rules for shop', async () => {
    const result = await service.findActiveRulesForShop(1, {}, 1, 'admin', 'admin');
    expect(VendorRules.findActiveRulesForShop).toHaveBeenCalledWith(prisma, 1, {}, 1, 'admin', 'admin');
    expect(result).toBe('shop-rules');
  });

  it('should find my rules', async () => {
    const result = await service.findMyRules(1, {}, 1);
    expect(VendorRules.findMyRules).toHaveBeenCalledWith(prisma, 1, {}, 1);
    expect(result).toBe('my-rules');
  });
});