import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as qs from 'qs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      querystringParser: (str) => qs.parse(str),
    }),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/', // Optional: Serve static assets under this route prefix
  });

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useBodyParser('json');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shopping Cart APi')
    .setDescription('Api documentation for the shopping cart')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Shoppingcart API Docs',
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation is available at: ${await app.getUrl()}/api-docs`,
  );
  console.log(
    `Using current date for context: ${new Date().toLocaleDateString('en-VN')} (Vietnam)`,
  );
}
bootstrap();
