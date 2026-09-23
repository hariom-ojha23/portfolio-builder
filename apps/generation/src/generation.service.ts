import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerationService {
  getHello(): string {
    return 'Hello World!';
  }
}
