import { Injectable } from '@nestjs/common';
import { appendFile, readFile } from 'fs/promises';
import path from 'path';
import { SignupDTO } from './dto/signup.dto';

@Injectable()
export class SignupService {

    async createUser(signupDto: SignupDTO) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const line = [
            signupDto.name,
            signupDto.username,
            signupDto.password,
            signupDto.phone,
        ]
            .map((value) => this.escapeCsv(value))
            .join(',');

        await appendFile(filePath, `${line}\n`, 'utf8');
        return { message: 'User Added' };
    }

    async findUser(username: string) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const users = await this.readCsv(filePath);
        return users.find((user) => user.username === username);
    }

    private async readCsv(filePath: string): Promise<SignupDTO[]> {
        const content = await readFile(filePath, 'utf8');
        return content
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0)
            .map((line) => {
                const [name, username, password, phone] =
                    this.parseCsvLine(line);
                return { name, username, password, phone };
            });
    }

    private parseCsvLine(line: string) {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"' && nextChar === '"') {
                current += '"';
                i += 1;
                continue;
            }

            if (char === '"') {
                inQuotes = !inQuotes;
                continue;
            }

            if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
                continue;
            }

            current += char;
        }

        values.push(current);
        return values;
    }

    private escapeCsv(value: string) {
        const needsQuotes = /[",\n]/.test(value);
        const escaped = value.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    }

   
}
