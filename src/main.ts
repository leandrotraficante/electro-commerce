import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';


const PORT = process.env.PORT ?? 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
