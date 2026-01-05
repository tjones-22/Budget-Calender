import { ConflictException, Injectable } from '@nestjs/common';
import path from 'path';
import { SignupDTO } from './dto/signup.dto';
import { appendCsvLine, readCsv } from '../utils/csv';

@Injectable()
export class SignupService {

    async createUser(signupDto: SignupDTO) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const existingUser = await this.findUser(signupDto.username);
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }
        const initialFunds =
            typeof signupDto.initialFunds === 'number'
                ? signupDto.initialFunds
                : 0;
        const initialSavings =
            typeof signupDto.initialSavings === 'number'
                ? signupDto.initialSavings
                : 0;
        const notifyBills = signupDto.notifyBills ? 'true' : 'false';
        const notifyPaydays = signupDto.notifyPaydays ? 'true' : 'false';
        await appendCsvLine(filePath, [
            signupDto.name,
            signupDto.username,
            signupDto.password,
            signupDto.phone,
            String(initialFunds),
            String(initialSavings),
            notifyBills,
            notifyPaydays,
        ]);
        return { message: 'User Added' };
    }

    async findUser(username: string) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const rows = await readCsv(filePath);
        const users = rows.map((row) => {
            const [
                name,
                usernameValue,
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
                name,
                username: usernameValue,
                password,
                phone,
                initialFunds: Number(initialFundsValue ?? 0),
                initialSavings: Number(initialSavingsValue ?? 0),
                notifyBills: notifyBillsValue === 'true',
                notifyPaydays: notifyPaydaysValue === 'true',
            };
        });
        return users.find((user) => user.username === username);
    }
}
