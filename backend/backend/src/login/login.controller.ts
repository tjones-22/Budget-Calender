import { LoginDTO } from './dto/login.dto';
import { LoginService } from './login.service';
import { Post, HttpCode, Body, Controller, Res } from '@nestjs/common';
import * as express from 'express';
@Controller('api/login')
export class LoginController {

    constructor(private readonly loginService: LoginService) {}

    @Post()
    @HttpCode(200)
    async login(
        @Body() loginDto: LoginDTO,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const user = await this.loginService.checkCredentials(
            loginDto.username,
            loginDto.password,
        );
        if (!user) {
            return { message: 'Invalid Credentials' };
        }

        const { sessionId } = await this.loginService.createSession(
            loginDto.username,
        );

        res.cookie('session', sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hrs
        });

        return { message: 'Logged in successfully' };
    }
}
