import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import { SignupController } from './signup/signup.controller';
import { SignupService } from './signup/signup.service';
import { SignupModule } from './signup/signup.module';
import { LoginService } from './login/login.service';
import { LoginController } from './login/login.controller';
import { LoginModule } from './login/login.module';
import { CalendarController } from './calendar/calendar.controller';
import { CalendarService } from './calendar/calendar.service';
import { GroupsService } from './groups/groups.service';
import { GroupsController } from './groups/groups.controller';
import { AccountController } from './account/account.controller';


@Module({
  imports: [ConfigModule.forRoot({isGlobal: true, envFilePath: '.env'}), SignupModule, LoginModule],
  controllers: [
    AppController,
    SignupController,
    LoginController,
    CalendarController,
    GroupsController,
    AccountController,
  ],
  providers: [
    AppService,
    SignupService,
    LoginService,
    CalendarService,
    GroupsService,
  ],
})
export class AppModule {}
