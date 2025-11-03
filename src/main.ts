import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';


const PORT = process.env.PORT ?? 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => {
    res.json({ message: 'ElectroCommerce API' });
  }); // ruta provisoria para verificar que la API está funcionando

  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // elimina propiedades no definidas en los DTOs
    forbidNonWhitelisted: true, // lanza error si vienen campos extra
    transform: true, // transforma los datos a los tipos definidos en los DTOs
  }));
  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
