import { Test, TestingModule } from '@nestjs/testing';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';

describe('GenerationController', () => {
  let generationController: GenerationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GenerationController],
      providers: [GenerationService],
    }).compile();

    generationController = app.get<GenerationController>(GenerationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(generationController.getHello()).toBe('Hello World!');
    });
  });
});
