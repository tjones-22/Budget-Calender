import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { LoggerMiddleware } from '../middleware/login.middleware';
import { GroupsService } from '../groups/groups.service';

@Module({
  controllers: [LoginController],
  providers: [LoginService, GroupsService],
})
export class LoginModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'api/login', method: RequestMethod.POST });
  }
}
