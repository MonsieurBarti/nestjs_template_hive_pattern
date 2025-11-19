import { Module } from '@nestjs/common';
import { ArticleModule } from './modules/article/article.module';
import { HealthModule } from './modules/health/health.module';

import { ConfigModule } from '@nestjs/config';
import { validate } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ArticleModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
