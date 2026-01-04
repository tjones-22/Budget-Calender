import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import { SignupController } from './signup/signup.controller';
import { SignupService } from './signup/signup.service';
import { SignupModule } from './signup/signup.module';


@Module({
  imports: [ConfigModule.forRoot({isGlobal: true, envFilePath: '.env'}), SignupModule],
  controllers: [AppController, SignupController],
  providers: [AppService, SignupService],
})
export class AppModule {}
