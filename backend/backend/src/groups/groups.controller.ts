import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { LoginService } from '../login/login.service';
import { GroupsService } from './groups.service';

type InviteRequest = {
  username: string;
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
};

type InviteResponseRequest = {
  inviteId: string;
  action: 'accept' | 'decline';
};

type MemberUpdateRequest = {
  username: string;
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
};

@Controller('api/groups')
export class GroupsController {
  constructor(
    private readonly loginService: LoginService,
    private readonly groupsService: GroupsService,
  ) {}

  @Post('invite')
  @HttpCode(200)
  async invite(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: InviteRequest,
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

    const currentUser = await this.loginService.findUserByUsername(
      session.username,
    );
    if (!currentUser) {
      res.status(404);
      return { message: 'User not found' };
    }

    const member = await this.groupsService.getMember(currentUser.username);
    if (!member || member.role !== 'owner') {
      res.status(403);
      return { message: 'Only group owners can invite.' };
    }

    const targetUsername = payload.username?.trim();
    if (!targetUsername) {
      throw new BadRequestException('Username is required');
    }
    if (targetUsername === currentUser.username) {
      throw new BadRequestException('Cannot share with yourself');
    }

    const targetUser = await this.loginService.findUserByUsername(
      targetUsername,
    );
    if (!targetUser) {
      res.status(404);
      return { message: 'User not found' };
    }

    const targetMember = await this.groupsService.getMember(targetUsername);
    if (targetMember && targetMember.groupId === member.groupId) {
      return { message: 'User already in this group' };
    }

    const invite = await this.groupsService.createInvite(
      currentUser.username,
      targetUsername,
      member.groupId,
      {
        canEdit: Boolean(payload.canEdit),
        shareEvents: Boolean(payload.shareEvents),
        shareBalances: Boolean(payload.shareBalances),
        shareAnalytics: Boolean(payload.shareAnalytics),
      },
    );
    return { message: 'Invite sent', invite };
  }

  @Get('invites')
  @HttpCode(200)
  async listInvites(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const sessionId = this.getSessionId(req);
    if (!sessionId) {
      res.status(401);
      return { invites: [] };
    }
    const session = this.loginService.getSession(sessionId);
    if (!session) {
      res.status(401);
      return { invites: [] };
    }
    const invites = await this.groupsService.listInvites(session.username);
    return { invites };
  }

  @Post('invites/respond')
  @HttpCode(200)
  async respondInvite(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: InviteResponseRequest,
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

    const inviteId = payload.inviteId?.trim();
    if (!inviteId) {
      throw new BadRequestException('Invite id is required');
    }
    if (!['accept', 'decline'].includes(payload.action)) {
      throw new BadRequestException('Invalid action');
    }

    const invite = await this.groupsService.respondInvite(
      inviteId,
      payload.action === 'accept',
    );
    if (!invite) {
      res.status(404);
      return { message: 'Invite not found' };
    }
    if (invite.toUsername !== session.username) {
      res.status(403);
      return { message: 'Not allowed' };
    }

    if (payload.action === 'accept') {
      await this.loginService.updateGroupId(invite.toUsername, invite.groupId);
      await this.groupsService.setMember(invite.toUsername, invite.groupId, 'viewer', {
        canEdit: invite.canEdit,
        shareEvents: invite.shareEvents,
        shareBalances: invite.shareBalances,
        shareAnalytics: invite.shareAnalytics,
      });
    }

    return { message: 'Invite updated', invite };
  }

  @Get('members')
  @HttpCode(200)
  async listMembers(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const sessionId = this.getSessionId(req);
    if (!sessionId) {
      res.status(401);
      return { members: [] };
    }
    const session = this.loginService.getSession(sessionId);
    if (!session) {
      res.status(401);
      return { members: [] };
    }
    const member = await this.groupsService.getMember(session.username);
    if (!member || member.role !== 'owner') {
      res.status(403);
      return { members: [] };
    }
    const members = await this.groupsService.listMembers(member.groupId);
    return { members };
  }

  @Post('members/update')
  @HttpCode(200)
  async updateMember(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
    @Body() payload: MemberUpdateRequest,
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
    const member = await this.groupsService.getMember(session.username);
    if (!member || member.role !== 'owner') {
      res.status(403);
      return { message: 'Only group owners can edit permissions.' };
    }
    const targetUsername = payload.username?.trim();
    if (!targetUsername) {
      throw new BadRequestException('Username is required');
    }
    if (targetUsername === member.username) {
      throw new BadRequestException('Cannot edit the owner');
    }
    const targetMember = await this.groupsService.getMember(targetUsername);
    if (!targetMember || targetMember.groupId !== member.groupId) {
      res.status(404);
      return { message: 'Member not found' };
    }
    if (targetMember.role === 'owner') {
      res.status(403);
      return { message: 'Cannot edit the owner' };
    }

    const updated = await this.groupsService.updateMemberSettings(
      targetUsername,
      member.groupId,
      {
        canEdit: Boolean(payload.canEdit),
        shareEvents: Boolean(payload.shareEvents),
        shareBalances: Boolean(payload.shareBalances),
        shareAnalytics: Boolean(payload.shareAnalytics),
      },
    );
    if (!updated) {
      res.status(404);
      return { message: 'Member not found' };
    }
    return { message: 'Permissions updated', member: updated };
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
