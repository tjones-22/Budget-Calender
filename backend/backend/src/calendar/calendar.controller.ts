import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { CalendarService } from './calendar.service';
import { CalendarMonth, formatDate } from './calendar';
import { LoginService } from '../login/login.service';
import { GroupsService } from '../groups/groups.service';

type DayUpdate = {
  date: string;
  bills?: { name: string; amount: number }[];
  paydays?: { name: string; amount: number }[];
  purchases?: { name: string; amount: number }[];
  savings?: { name: string; amount: number }[];
};

type RecurringCreate = {
  date: string;
  type: 'bill' | 'payday' | 'purchase' | 'savings';
  name: string;
  amount: number;
  cadence: 'weekly' | 'biweekly' | 'monthly';
  monthsCount?: number;
  forever?: boolean;
};

type RecurringDelete = {
  recurringId: string;
  date: string;
  scope: 'one' | 'all';
};

@Controller('api/calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly loginService: LoginService,
    private readonly groupsService: GroupsService,
  ) {}

  @Get()
  @HttpCode(200)
  async getMonth(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Query('year') yearValue?: string,
    @Query('month') monthValue?: string,
  ) {
    const now = new Date();
    const year = yearValue ? Number(yearValue) : now.getFullYear();
    const month = monthValue ? Number(monthValue) : now.getMonth() + 1;

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw new BadRequestException('Year and month must be integers');
    }
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }

    const sessionId = this.getSessionId(req);
    if (!sessionId) {
      res.status(401);
      return { year, month, matrix: [] };
    }
    const session = this.loginService.getSession(sessionId);
    if (!session) {
      res.status(401);
      return { year, month, matrix: [] };
    }
    const member = await this.groupsService.getMember(session.username);
    if (!member) {
      res.status(404);
      return { year, month, matrix: [] };
    }

    const matrix = member.shareEvents
      ? await this.calendarService.getMonth(year, month - 1, member.groupId)
      : new CalendarMonth(year, month - 1, new Map()).matrix;
    return { year, month, matrix };
  }

  @Post('day')
  @HttpCode(200)
  async upsertDay(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: DayUpdate,
  ) {
    const date = payload.date?.trim();
    if (!date) {
      throw new BadRequestException('Date is required');
    }
    const parsedDate = this.parseLocalDate(date);
    if (!parsedDate) {
      throw new BadRequestException('Invalid date format');
    }

    const normalized = formatDate(parsedDate);
    const bills = payload.bills ?? [];
    const paydays = payload.paydays ?? [];
    const purchases = payload.purchases ?? [];
    const savings = payload.savings ?? [];

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
    const member = await this.groupsService.getMember(session.username);
    if (!member || !member.shareEvents || !member.canEdit) {
      res.status(403);
      return { message: 'Not allowed' };
    }

    await this.calendarService.upsertDay(
      normalized,
      member.groupId,
      bills,
      paydays,
      purchases,
      savings,
    );
    return { message: 'Day updated', date: normalized };
  }

  @Post('recurring')
  @HttpCode(200)
  async createRecurring(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: RecurringCreate,
  ) {
    const date = payload.date?.trim();
    if (!date) {
      throw new BadRequestException('Date is required');
    }
    const parsedDate = this.parseLocalDate(date);
    if (!parsedDate) {
      throw new BadRequestException('Invalid date format');
    }
    const name = payload.name?.trim();
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    if (!Number.isFinite(payload.amount)) {
      throw new BadRequestException('Amount is required');
    }
    if (!['bill', 'payday', 'purchase', 'savings'].includes(payload.type)) {
      throw new BadRequestException('Invalid type');
    }
    if (!['weekly', 'biweekly', 'monthly'].includes(payload.cadence)) {
      throw new BadRequestException('Invalid cadence');
    }
    const monthsCount = payload.monthsCount;
    const monthsCountNumber = Number(monthsCount);
    const forever = Boolean(payload.forever);
    if (!forever) {
      if (!Number.isInteger(monthsCountNumber) || monthsCountNumber <= 0) {
        throw new BadRequestException('Months count must be a positive integer');
      }
    }

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
    const member = await this.groupsService.getMember(session.username);
    if (!member || !member.shareEvents || !member.canEdit) {
      res.status(403);
      return { message: 'Not allowed' };
    }

    const rule = await this.calendarService.createRecurringRule(member.groupId, {
      type: payload.type,
      name,
      amount: Number(payload.amount),
      startDate: formatDate(parsedDate),
      cadence: payload.cadence,
      monthsCount: forever ? null : monthsCountNumber,
      forever,
    });
    return { message: 'Recurring rule created', rule };
  }

  @Post('recurring/delete')
  @HttpCode(200)
  async deleteRecurring(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: RecurringDelete,
  ) {
    const recurringId = payload.recurringId?.trim();
    if (!recurringId) {
      throw new BadRequestException('Recurring id is required');
    }
    const date = payload.date?.trim();
    if (!date) {
      throw new BadRequestException('Date is required');
    }
    const parsedDate = this.parseLocalDate(date);
    if (!parsedDate) {
      throw new BadRequestException('Invalid date format');
    }
    if (!['one', 'all'].includes(payload.scope)) {
      throw new BadRequestException('Invalid scope');
    }

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
    const member = await this.groupsService.getMember(session.username);
    if (!member || !member.shareEvents || !member.canEdit) {
      res.status(403);
      return { message: 'Not allowed' };
    }

    await this.calendarService.deleteRecurring(
      member.groupId,
      recurringId,
      formatDate(parsedDate),
      payload.scope,
    );
    return { message: 'Recurring rule updated' };
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

  private parseLocalDate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
