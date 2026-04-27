import * as dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables globally before any other service initializes
dotenv.config()
dotenv.config({ path: join(__dirname, '../../.env') })

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Set global prefix to support proper routing in all environments
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
  await app.listen(3000)
  console.log('Backend running on http://localhost:3000/api')
}
bootstrap()
