import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { readCsv } from '../utils/csv';
import path from 'path';


@Injectable()
export class LoginService {
    private readonly sessions = new Map<
        string,
        { username: string; createdAt: number; expiresAt: number }
    >();

    async checkCredentials(username: string, password: string) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const rows = await readCsv(filePath);
        const accounts = rows.map(([name, username, password, phone]) => ({
            name,
            username,
            password,
            phone,
        }));

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

   
    async createSession(username: string, ttlMs = 24 * 60 * 60 * 1000) {
        const sessionId = randomUUID();
        const createdAt = Date.now();
        const expiresAt = createdAt + ttlMs;
        this.sessions.set(sessionId, { username, createdAt, expiresAt });
        return { sessionId, expiresAt };
    }
}
