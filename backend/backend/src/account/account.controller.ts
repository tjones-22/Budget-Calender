import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import * as express from 'express';
import { LoginService } from '../login/login.service';

type AccountUpdate = {
  name?: string;
  phone?: string;
  notifyBills?: boolean;
  notifyPaydays?: boolean;
};

@Controller('api/account')
export class AccountController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  @HttpCode(200)
  async getAccount(
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
        phone: user.phone,
        notifyBills: user.notifyBills ?? false,
        notifyPaydays: user.notifyPaydays ?? false,
      },
    };
  }

  @Post()
  @HttpCode(200)
  async updateAccount(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: AccountUpdate,
  ) {
    const sessionId = this.getSessionId(req);
    if (!sessionId) {
      res.status(401);
      return { message: 'Unauthorized' };
    }
    const session = this.loginService.getSession(sessionId);
    if (!session) {
      res.status(401);
      return { message: 'Unauthorized' };
    }

    if (payload.phone != null) {
      const phone = payload.phone.trim();
      const isValid = /^\(\d{3}\)-\d{3}-\d{4}$/.test(phone);
      if (!isValid) {
        throw new BadRequestException('Invalid phone format');
      }
    }

    await this.loginService.updateAccount(session.username, {
      name: payload.name?.trim(),
      phone: payload.phone?.trim(),
      notifyBills: payload.notifyBills,
      notifyPaydays: payload.notifyPaydays,
    });

    return { message: 'Account updated' };
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
}
