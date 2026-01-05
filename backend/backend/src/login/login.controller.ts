import { LoginDTO } from './dto/login.dto';
import { LoginService } from './login.service';
import { Get, Post, HttpCode, Body, Controller, Res, Req } from '@nestjs/common';
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

        const { sessionId, expiresAt } = await this.loginService.createSession(
            loginDto.username,
        );

        res.cookie('session', sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hrs
        });

        return { message: 'Logged in successfully', sessionId, expiresAt };
    }

    @Get('me')
    @HttpCode(200)
    async me(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const sessionId = this.getSessionId(req);
        if (!sessionId) {
            res.status(401);
            return { user: null };
        }

        const session = this.loginService.getSession(sessionId);
        if (!session) {
            res.status(401);
            return { user: null };
        }

        const user = await this.loginService.findUserByUsername(session.username);
        if (!user) {
            res.status(404);
            return { user: null };
        }

        return {
            user: {
                name: user.name,
                username: user.username,
                initialFunds: user.initialFunds ?? 0,
                initialSavings: user.initialSavings ?? 0,
            },
        };
    }

    private getCookie(cookieHeader: string | undefined, name: string) {
        if (!cookieHeader) {
            return null;
        }
        const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
        const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
        if (!match) {
            return null;
        }
        return decodeURIComponent(match.slice(name.length + 1));
    }

    @Post('logout')
    @HttpCode(200)
    async logout(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const sessionId = this.getSessionId(req);
        if (sessionId) {
            this.loginService.deleteSession(sessionId);
        }
        res.clearCookie('session', { path: '/' });
        return { message: 'Logged out' };
    }

    private getSessionId(req: express.Request) {
        const headerValue = req.headers['x-session-id'];
        if (typeof headerValue === 'string' && headerValue.trim()) {
            return headerValue.trim();
        }
        const authHeader = req.headers.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice('Bearer '.length).trim();
            if (token) {
                return token;
            }
        }
        return this.getCookie(req.headers.cookie, 'session');
    }
}
