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
        await appendCsvLine(filePath, [
            signupDto.name,
            signupDto.username,
            signupDto.password,
            signupDto.phone,
        ]);
        return { message: 'User Added' };
    }

    async findUser(username: string) {
        const filePath = path.join(process.cwd(), 'db', 'users.csv');
        const rows = await readCsv(filePath);
        const users = rows.map(([name, usernameValue, password, phone]) => ({
            name,
            username: usernameValue,
            password,
            phone,
        }));
        return users.find((user) => user.username === username);
    }
}
