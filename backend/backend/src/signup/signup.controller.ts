import { BadRequestException, Controller, Get } from '@nestjs/common';
import { SignupService } from './signup.service';
import { Post, HttpCode, Body } from '@nestjs/common';
import { SignupDTO } from './dto/signup.dto';

@Controller('/api/signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  @HttpCode(201)
  createUser(@Body() signupDto: SignupDTO) {
    const phone = signupDto.phone ?? '';
    const isValid = /^\(\d{3}\)-\d{3}-\d{4}$/.test(phone);

    if (!isValid) {
      throw new BadRequestException('Invalid phone format');
    }
    return this.signupService.createUser(signupDto);
  }

  @Get()
  @HttpCode(200)
  async findUser(@Body() signupDto: SignupDTO) {
    return this.signupService.findUser(signupDto.username);
  }
}
