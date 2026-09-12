import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from './database/database.module'
import { SnowflakeModule } from './core/snowflake/snowflake.module'
import { AuthModule } from './modules/auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './core/guards/jwt-auth/jwt-auth.guard'
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    SnowflakeModule,
    UserModule,
    AuthModule,
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
