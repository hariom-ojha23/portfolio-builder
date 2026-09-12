import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import type { PortfolioConfig } from '../../../core/interfaces/portfolio-config.interface'

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string

  @IsString()
  @IsNotEmpty()
  templateId!: string

  @IsNotEmpty()
  data!: PortfolioConfig
}
