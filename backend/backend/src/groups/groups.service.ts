import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { escapeCsv, parseCsvLine } from '../utils/csv';

export type GroupRecord = {
  id: string;
  ownerUsername: string;
  funds: number;
  savings: number;
};

export type MemberRecord = {
  groupId: string;
  username: string;
  role: 'owner' | 'viewer';
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
};

export type InviteRecord = {
  id: string;
  groupId: string;
  fromUsername: string;
  toUsername: string;
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
};

type ShareSettings = Pick<
  MemberRecord,
  'canEdit' | 'shareEvents' | 'shareBalances' | 'shareAnalytics'
>;

@Injectable()
export class GroupsService {
  private readonly groupsPath = path.join(process.cwd(), 'db', 'groups.csv');
  private readonly membersPath = path.join(
    process.cwd(),
    'db',
    'group_members.csv',
  );
  private readonly invitesPath = path.join(
    process.cwd(),
    'db',
    'group_invites.csv',
  );

  async createGroupForOwner(
    username: string,
    funds: number,
    savings: number,
  ) {
    const groupId = `grp_${username}_${Date.now()}`;
    await this.ensureGroup(groupId, username, funds, savings);
    await this.setMember(username, groupId, 'owner', {
      canEdit: true,
      shareEvents: true,
      shareBalances: true,
      shareAnalytics: true,
    });
    return groupId;
  }

  async ensureGroup(
    groupId: string,
    ownerUsername: string,
    funds: number,
    savings: number,
  ) {
    const groups = await this.readGroups();
    if (!groups.some((group) => group.id === groupId)) {
      groups.push({ id: groupId, ownerUsername, funds, savings });
      await this.writeGroups(groups);
    }
  }

  async getGroup(groupId: string) {
    const groups = await this.readGroups();
    return groups.find((group) => group.id === groupId) ?? null;
  }

  async getMember(username: string) {
    const members = await this.readMembers();
    return members.find((member) => member.username === username) ?? null;
  }

  async listMembers(groupId: string) {
    const members = await this.readMembers();
    return members.filter((member) => member.groupId === groupId);
  }

  async updateMemberSettings(
    username: string,
    groupId: string,
    settings: ShareSettings,
  ) {
    const members = await this.readMembers();
    let updated: MemberRecord | null = null;
    const nextMembers = members.map((member) => {
      if (member.groupId === groupId && member.username === username) {
        updated = {
          ...member,
          ...settings,
        };
        return updated;
      }
      return member;
    });
    if (!updated) {
      return null;
    }
    await this.writeMembers(nextMembers);
    return updated;
  }

  async listInvites(username: string) {
    const invites = await this.readInvites();
    return invites.filter(
      (invite) =>
        invite.toUsername === username && invite.status === 'pending',
    );
  }

  async createInvite(
    fromUsername: string,
    toUsername: string,
    groupId: string,
    settings: ShareSettings,
  ) {
    const invites = await this.readInvites();
    const existing = invites.find(
      (invite) =>
        invite.groupId === groupId &&
        invite.toUsername === toUsername &&
        invite.status === 'pending',
    );
    if (existing) {
      return existing;
    }
    const nextInvite: InviteRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      groupId,
      fromUsername,
      toUsername,
      status: 'pending',
      createdAt: Date.now(),
      ...settings,
    };
    invites.push(nextInvite);
    await this.writeInvites(invites);
    return nextInvite;
  }

  async respondInvite(inviteId: string, accept: boolean) {
    const invites = await this.readInvites();
    const index = invites.findIndex((invite) => invite.id === inviteId);
    if (index === -1) {
      return null;
    }
    const invite = invites[index];
    invites.splice(index, 1);
    await this.writeInvites(invites);
    return { ...invite, status: accept ? 'accepted' : 'declined' };
  }

  async setMember(
    username: string,
    groupId: string,
    role: MemberRecord['role'],
    settings: ShareSettings,
  ) {
    const members = await this.readMembers();
    const nextMembers = members.filter(
      (member) => member.username !== username,
    );
    nextMembers.push({
      groupId,
      username,
      role,
      ...settings,
    });
    await this.writeMembers(nextMembers);
  }

  private async readGroups(): Promise<GroupRecord[]> {
    try {
      const content = await readFile(this.groupsPath, 'utf8');
      if (!content.trim()) {
        return [];
      }
      return content
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => parseCsvLine(line))
        .map(([id, ownerUsername, fundsValue, savingsValue]) => ({
          id,
          ownerUsername,
          funds: Number(fundsValue ?? 0),
          savings: Number(savingsValue ?? 0),
        }));
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeGroups(groups: GroupRecord[]) {
    const output = groups
      .map((group) =>
        [
          group.id,
          group.ownerUsername,
          String(group.funds ?? 0),
          String(group.savings ?? 0),
        ]
          .map((value) => escapeCsv(value))
          .join(','),
      )
      .join('\n');
    await writeFile(this.groupsPath, output ? `${output}\n` : '', 'utf8');
  }

  private async readMembers(): Promise<MemberRecord[]> {
    try {
      const content = await readFile(this.membersPath, 'utf8');
      if (!content.trim()) {
        return [];
      }
      return content
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => parseCsvLine(line))
        .map(
          ([
            groupId,
            username,
            role,
            canEditValue,
            shareEventsValue,
            shareBalancesValue,
            shareAnalyticsValue,
          ]) => ({
            groupId,
            username,
            role: role === 'owner' ? 'owner' : 'viewer',
            canEdit: canEditValue === 'true',
            shareEvents: shareEventsValue === 'true',
            shareBalances: shareBalancesValue === 'true',
            shareAnalytics: shareAnalyticsValue === 'true',
          }),
        );
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeMembers(members: MemberRecord[]) {
    const output = members
      .map((member) =>
        [
          member.groupId,
          member.username,
          member.role,
          member.canEdit ? 'true' : 'false',
          member.shareEvents ? 'true' : 'false',
          member.shareBalances ? 'true' : 'false',
          member.shareAnalytics ? 'true' : 'false',
        ]
          .map((value) => escapeCsv(value))
          .join(','),
      )
      .join('\n');
    await writeFile(this.membersPath, output ? `${output}\n` : '', 'utf8');
  }

  private async readInvites(): Promise<InviteRecord[]> {
    try {
      const content = await readFile(this.invitesPath, 'utf8');
      if (!content.trim()) {
        return [];
      }
      return content
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => parseCsvLine(line))
        .map(
          ([
            id,
            groupId,
            fromUsername,
            toUsername,
            canEditValue,
            shareEventsValue,
            shareBalancesValue,
            shareAnalyticsValue,
            statusValue,
            createdAtValue,
          ]) => ({
            id,
            groupId,
            fromUsername,
            toUsername,
            canEdit: canEditValue === 'true',
            shareEvents: shareEventsValue === 'true',
            shareBalances: shareBalancesValue === 'true',
            shareAnalytics: shareAnalyticsValue === 'true',
            status:
              statusValue === 'accepted'
                ? 'accepted'
                : statusValue === 'declined'
                  ? 'declined'
                  : 'pending',
            createdAt: Number(createdAtValue ?? 0),
          }),
        );
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeInvites(invites: InviteRecord[]) {
    const output = invites
      .map((invite) =>
        [
          invite.id,
          invite.groupId,
          invite.fromUsername,
          invite.toUsername,
          invite.canEdit ? 'true' : 'false',
          invite.shareEvents ? 'true' : 'false',
          invite.shareBalances ? 'true' : 'false',
          invite.shareAnalytics ? 'true' : 'false',
          invite.status,
          String(invite.createdAt),
        ]
          .map((value) => escapeCsv(value))
          .join(','),
      )
      .join('\n');
    await writeFile(this.invitesPath, output ? `${output}\n` : '', 'utf8');
  }
}
