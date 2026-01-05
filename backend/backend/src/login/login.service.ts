import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { readCsv } from '../utils/csv';
import path from 'path';

type Account = {
    name: string;
    username: string;
    password: string;
    phone: string;
    initialFunds?: number;
    initialSavings?: number;
    notifyBills?: boolean;
    notifyPaydays?: boolean;
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
        return rows.map((row) => {
            const [
                name,
                username,
                password,
                phone,
                initialFundsValue,
                columnSix,
                columnSeven,
                columnEight,
            ] = row;
            const hasSavings = row.length >= 8;
            const initialSavingsValue = hasSavings ? columnSix : undefined;
            const notifyBillsValue = hasSavings ? columnSeven : columnSix;
            const notifyPaydaysValue = hasSavings ? columnEight : columnSeven;
            return {
                name: name ?? '',
                username: username ?? '',
                password: password ?? '',
                phone: phone ?? '',
                initialFunds: Number(initialFundsValue ?? 0),
                initialSavings: Number(initialSavingsValue ?? 0),
                notifyBills: notifyBillsValue === 'true',
                notifyPaydays: notifyPaydaysValue === 'true',
            };
        });
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
