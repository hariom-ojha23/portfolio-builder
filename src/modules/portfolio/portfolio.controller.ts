import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { CreatePortfolioDto } from './dto/create-portfolio.dto'
import { CurrentUserId } from '../../core/decorators/current-user.decorator'
import { UpdatePortfolioDto } from './dto/update-portfolio.dto'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  async createPortfolio(
    @Body() dto: CreatePortfolioDto,
    @CurrentUserId() userId: string,
  ) {
    return this.portfolioService.createPortfolio(userId, dto)
  }

  @Get()
  async getAllPortfolios(@CurrentUserId() userId: string) {
    return this.portfolioService.findAllPortfolio(userId)
  }

  @Get('recent')
  async getRecentPortfolios(@CurrentUserId() userId: string) {
    return this.portfolioService.findRecentPortfolios(userId)
  }

  @Get(':id')
  async getPortfolioById(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ) {
    return this.portfolioService.findPortfolioById(id, userId)
  }

  @Patch(':id')
  async updatePortfolio(
    @Body() dto: UpdatePortfolioDto,
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ) {
    return this.portfolioService.updatePortfolio(id, userId, dto)
  }

  @Delete(':id')
  async deletePortfolio(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ) {
    return this.portfolioService.removePortfolio(id, userId)
  }
}
