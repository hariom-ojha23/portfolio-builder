import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Portfolio } from './entity/portfolio.entity'
import { Repository } from 'typeorm'
import { CreatePortfolioDto } from './dto/create-portfolio.dto'
import { SnowflakeService } from '../../core/snowflake/snowflake.service'
import { UpdatePortfolioDto } from './dto/update-portfolio.dto'

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  async createPortfolio(
    userId: string,
    dto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    const portfolio = this.portfolioRepo.create({
      id: this.snowflakeService.generate().toString(),
      userId,
      name: dto.name,
      data: dto.data,
      templateId: dto.templateId,
    })

    return this.portfolioRepo.save(portfolio)
  }

  async findAllPortfolio(userId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    })
  }

  async findPortfolioById(
    portfolioId: string,
    userId: string,
  ): Promise<Portfolio> {
    const portfolio = await this.portfolioRepo.findOne({
      where: {
        id: portfolioId,
        userId,
      },
    })

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found')
    }

    return portfolio
  }

  async findRecentPortfolios(userId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 3,
    })
  }

  async updatePortfolio(
    portfolioId: string,
    userId: string,
    dto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    const portfolio = await this.findPortfolioById(portfolioId, userId)
    Object.assign(portfolio, dto)

    return this.portfolioRepo.save(portfolio)
  }

  async removePortfolio(portfolioId: string, userId: string): Promise<void> {
    const portfolio = await this.findPortfolioById(portfolioId, userId)

    const result = await this.portfolioRepo.delete({
      id: portfolio.id,
      userId,
    })

    if (result.affected === 0) {
      throw new NotFoundException('Portfolio not found')
    }
  }
}
