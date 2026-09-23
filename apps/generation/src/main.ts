import { NestFactory } from '@nestjs/core'
import { GenerationModule } from './generation.module'

import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(GenerationModule)

  app.use(cookieParser())

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  const PORT = process.env.GENERATION_PORT ?? 3002
  await app.listen(PORT, () => {
    console.info('Generation server is listening on', PORT)
  })
}
bootstrap()
