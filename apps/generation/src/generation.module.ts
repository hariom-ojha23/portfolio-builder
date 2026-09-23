import { Module } from '@nestjs/common';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';

@Module({
  imports: [],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
