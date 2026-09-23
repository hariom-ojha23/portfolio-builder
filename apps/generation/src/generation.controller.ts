import { Controller, Get } from '@nestjs/common';
import { GenerationService } from './generation.service';

@Controller()
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Get()
  getHello(): string {
    return this.generationService.getHello();
  }
}
