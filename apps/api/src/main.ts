import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/httpException.filter'

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
