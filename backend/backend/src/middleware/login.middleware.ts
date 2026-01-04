
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const {username, password} = req.body;

    if(!username || !password){
        res.status(400).send('Username and password are required');
        return;
    }
    next();
  }
}
