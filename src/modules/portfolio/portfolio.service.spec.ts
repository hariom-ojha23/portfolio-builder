jest.mock('@nestjs/typeorm', () => ({ InjectRepository: () => () => {} }))

import { PortfolioService } from './portfolio.service'
import { Portfolio } from './entity/portfolio.entity'
import { SnowflakeService } from '../../core/snowflake/snowflake.service'
import { Repository } from 'typeorm'
import { CreatePortfolioDto } from './dto/create-portfolio.dto'
import { NotFoundException } from '@nestjs/common'
import { UpdatePortfolioDto } from './dto/update-portfolio.dto'

describe('PortfolioService', () => {
  let service: PortfolioService
  let portfolioRepo: jest.Mocked<Repository<Portfolio>>
  let snowflakeService: jest.Mocked<SnowflakeService>

  beforeEach(() => {
    portfolioRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Portfolio>>

    snowflakeService = {
      generate: jest.fn(),
    } as unknown as jest.Mocked<SnowflakeService>

    service = new PortfolioService(portfolioRepo, snowflakeService)
  })

  afterEach(() => jest.clearAllMocks())

  it('portfolio service should be defined', () => {
    expect(service).toBeDefined()
  })

  it('snowflake service should be defined', () => {
    expect(snowflakeService).toBeDefined()
  })

  it('portfolio repo should be defined', () => {
    expect(portfolioRepo).toBeDefined()
  })

  describe('createPortfolio', () => {
    it('should create and save portfolio', async () => {
      const userId = '752952151470247345'
      const dto: CreatePortfolioDto = {
        name: 'My Portfolio',
        templateId: 'minimal-001',
        data: {
          settings: {
            site: {
              title: 'John Doe',
              description: 'Software Developer',
              language: 'en',
            },
            sections: {} as any,
          },
          profile: {
            name: 'John Doe',
            title: 'Software Developer',
            bio: 'Building software.',
          },
        },
      }

      const portfolio = {
        id: '752952151473457345',
        userId,
        ...dto,
      } as Portfolio

      snowflakeService.generate.mockReturnValue(BigInt('752952151473457345'))

      portfolioRepo.create.mockReturnValue(portfolio)
      portfolioRepo.save.mockResolvedValue(portfolio)

      const result = await service.createPortfolio(userId, dto)

      expect(snowflakeService.generate).toHaveBeenCalledTimes(1)
      expect(portfolioRepo.create).toHaveBeenCalledWith({
        id: '752952151473457345',
        userId,
        name: dto.name,
        templateId: dto.templateId,
        data: dto.data,
      })

      expect(portfolioRepo.save).toHaveBeenCalledWith(portfolio)
      expect(result).toBe(portfolio)
    })
  })

  describe('findAllPortfolio', () => {
    it('should return all portfolios belonging to user', async () => {
      const userId = '752952151470247345'

      const portfolios = [
        { id: '1', userId },
        { id: '2', userId },
      ] as Portfolio[]

      portfolioRepo.find.mockResolvedValue(portfolios)

      const result = await service.findAllPortfolio(userId)

      expect(portfolioRepo.find).toHaveBeenCalledWith({
        where: { userId },
        order: { updatedAt: 'DESC' },
      })

      expect(result).toBe(portfolios)
    })
  })

  describe('findRecentPortfolios', () => {
    it('should return the three most recently updated portfolios', async () => {
      const userId = '752952151470247345'

      const portfolios = [
        { id: '1', userId },
        { id: '2', userId },
        { id: '3', userId },
      ] as Portfolio[]

      portfolioRepo.find.mockResolvedValue(portfolios)

      const result = await service.findRecentPortfolios(userId)

      expect(portfolioRepo.find).toHaveBeenCalledWith({
        where: { userId },
        order: { updatedAt: 'DESC' },
        take: 3,
      })

      expect(result).toBe(portfolios)
    })
  })

  describe('findPortfolioById', () => {
    it('should return a portfolio belonging to the user', async () => {
      const userId = '752952151470247345'
      const portfolioId = '1'

      const portfolio = { id: portfolioId, userId } as Portfolio

      portfolioRepo.findOne.mockResolvedValue(portfolio)

      const result = await service.findPortfolioById(portfolioId, userId)

      expect(portfolioRepo.findOne).toHaveBeenCalledWith({
        where: { id: portfolioId, userId },
      })

      expect(result).toBe(portfolio)
    })

    it("should throw not found exception if portfolio doesn't belong to user", async () => {
      const userId = '752952151470247345'
      const portfolioId = '1'

      portfolioRepo.findOne.mockResolvedValue(null)

      await expect(
        service.findPortfolioById(portfolioId, userId),
      ).rejects.toThrow(new NotFoundException('Portfolio not found'))

      expect(portfolioRepo.findOne).toHaveBeenCalledWith({
        where: { id: portfolioId, userId },
      })
    })
  })

  describe('updatePortfolio', () => {
    it('should update an owned portfolio', async () => {
      const userId = '752952151470247345'
      const portfolioId = '752952151470247675'

      const portfolio = {
        id: portfolioId,
        userId,
        name: 'Old Name',
        templateId: 'minimal-001',
      } as Portfolio

      const dto: UpdatePortfolioDto = { name: 'New Name' }

      portfolioRepo.findOne.mockResolvedValue(portfolio)
      portfolioRepo.save.mockResolvedValue({ ...portfolio, ...dto })

      const result = await service.updatePortfolio(portfolioId, userId, dto)

      expect(portfolioRepo.findOne).toHaveBeenCalledWith({
        where: { id: portfolioId, userId },
      })

      expect(portfolioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: portfolioId,
          name: 'New Name',
          userId: userId,
        }),
      )

      expect(result.name).toBe(dto.name)
    })

    it('should throw when updating another user portfolio', async () => {
      const userId = '752952151470247345'
      const portfolioId = '752952151470247675'

      portfolioRepo.findOne.mockResolvedValue(null)

      await expect(
        service.updatePortfolio(portfolioId, userId, { name: 'New Name' }),
      ).rejects.toThrow(new NotFoundException('Portfolio not found'))

      expect(portfolioRepo.save).not.toHaveBeenCalled()
    })
  })

  describe('removePortfolio', () => {
    it('should delete an owned portfolio', async () => {
      const userId = '752952151470247345'
      const portfolioId = '752952151470247675'

      const portfolio = {
        id: portfolioId,
        userId,
      } as Portfolio

      portfolioRepo.findOne.mockResolvedValue(portfolio)
      portfolioRepo.delete.mockResolvedValue({ affected: 1, raw: {} } as any)

      await service.removePortfolio(portfolioId, userId)

      expect(portfolioRepo.findOne).toHaveBeenCalledWith({
        where: { id: portfolioId, userId },
      })

      expect(portfolioRepo.delete).toHaveBeenCalledWith({
        id: portfolioId,
        userId,
      })
    })

    it("should throw when portfolio not found or doesn't exist", async () => {
      const userId = '752952151470247345'
      const portfolioId = '752952151470247675'

      portfolioRepo.findOne.mockResolvedValue(null)
      portfolioRepo.delete.mockResolvedValue({ affected: 1, raw: {} })

      await expect(
        service.removePortfolio(portfolioId, userId),
      ).rejects.toThrow(new NotFoundException('Portfolio not found'))

      expect(portfolioRepo.delete).not.toHaveBeenCalled()
    })
  })
})
