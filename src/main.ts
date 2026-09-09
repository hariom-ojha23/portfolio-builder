import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })

  app.setGlobalPrefix('/api/v1')

  const PORT = process.env.PORT
  await app.listen(PORT ?? 3000, () => {
    console.info('Server is listening on', PORT)
  })
}
bootstrap()
