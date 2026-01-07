import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { readCsv, escapeCsv } from '../utils/csv';
import path from 'path';
import { writeFile } from 'fs/promises';

type Account = {
    name: string;
    username: string;
    password: string;
    phone: string;
    initialFunds?: number;
    initialSavings?: number;
    notifyBills?: boolean;
    notifyPaydays?: boolean;
    groupId?: string;
};


@Injectable()
export class LoginService {
    private readonly sessions = new Map<
        string,
        { username: string; createdAt: number; expiresAt: number }
    >();

    private async loadAccounts(): Promise<Account[]> {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const rows = await readCsv(filePath);
        return rows.map((row) => this.normalizeAccountRow(row));
    }

    async updateGroupId(username: string, groupId: string) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const rows = await readCsv(filePath);
        const updated = rows.map((row) => {
            const account = this.normalizeAccountRow(row);
            if (account.username === username) {
                account.groupId = groupId;
            }
            return [
                account.name,
                account.username,
                account.password,
                account.phone,
                String(account.initialFunds ?? 0),
                String(account.initialSavings ?? 0),
                account.notifyBills ? 'true' : 'false',
                account.notifyPaydays ? 'true' : 'false',
                account.groupId ?? '',
            ];
        });
        const output = updated
            .map((row) => row.map((value) => escapeCsv(value)).join(','))
            .join('\n');
        await writeFile(filePath, output ? `${output}\n` : '', 'utf8');
    }

    async updateAccount(
        username: string,
        updates: {
            name?: string;
            phone?: string;
            notifyBills?: boolean;
            notifyPaydays?: boolean;
        },
    ) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const rows = await readCsv(filePath);
        const updated = rows.map((row) => {
            const account = this.normalizeAccountRow(row);
            if (account.username === username) {
                if (updates.name != null) {
                    account.name = updates.name;
                }
                if (updates.phone != null) {
                    account.phone = updates.phone;
                }
                if (updates.notifyBills != null) {
                    account.notifyBills = updates.notifyBills;
                }
                if (updates.notifyPaydays != null) {
                    account.notifyPaydays = updates.notifyPaydays;
                }
            }
            return [
                account.name,
                account.username,
                account.password,
                account.phone,
                String(account.initialFunds ?? 0),
                String(account.initialSavings ?? 0),
                account.notifyBills ? 'true' : 'false',
                account.notifyPaydays ? 'true' : 'false',
                account.groupId ?? '',
            ];
        });
        const output = updated
            .map((row) => row.map((value) => escapeCsv(value)).join(','))
            .join('\n');
        await writeFile(filePath, output ? `${output}\n` : '', 'utf8');
    }

    private normalizeAccountRow(row: string[]): Account {
        const [
            name,
            username,
            password,
            phone,
            initialFundsValue,
            columnSix,
            columnSeven,
            columnEight,
            columnNine,
        ] = row;
        const hasSavings = row.length >= 8;
        const hasGroup = row.length >= 9;
        const initialSavingsValue = hasSavings ? columnSix : undefined;
        const notifyBillsValue = hasSavings ? columnSeven : columnSix;
        const notifyPaydaysValue = hasSavings ? columnEight : columnSeven;
        const groupIdValue = hasGroup ? columnNine : undefined;
        return {
            name: name ?? '',
            username: username ?? '',
            password: password ?? '',
            phone: phone ?? '',
            initialFunds: Number(initialFundsValue ?? 0),
            initialSavings: Number(initialSavingsValue ?? 0),
            notifyBills: notifyBillsValue === 'true',
            notifyPaydays: notifyPaydaysValue === 'true',
            groupId: groupIdValue?.trim(),
        };
    }

    async checkCredentials(username: string, password: string) {
        const accounts = await this.loadAccounts();

        const user = accounts.find((user) => user.username === username);
        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return null;
        }

        return user;
    }

    async findUserByUsername(username: string) {
        const accounts = await this.loadAccounts();
        const user = accounts.find((account) => account.username === username);
        return user ?? null;
    }

    getSession(sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        if (session.expiresAt <= Date.now()) {
            this.sessions.delete(sessionId);
            return null;
        }
        return session;
    }

    deleteSession(sessionId: string) {
        this.sessions.delete(sessionId);
    }
   
    async createSession(username: string, ttlMs = 24 * 60 * 60 * 1000) {
        const sessionId = randomUUID();
        const createdAt = Date.now();
        const expiresAt = createdAt + ttlMs;
        this.sessions.set(sessionId, { username, createdAt, expiresAt });
        return { sessionId, expiresAt };
    }
}
