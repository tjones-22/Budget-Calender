import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { LoggerMiddleware } from '../middleware/login.middleware';

@Module({
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(LoginController);
  }
}
