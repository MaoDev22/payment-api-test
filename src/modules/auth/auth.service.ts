import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '@app/modules/users/users.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(private readonly jwtServ: JwtService, private readonly usersService: UsersService) {}
    
    async validateToken(token: string) {
        const payload: JwtPayload = this.jwtServ.verify(token, {
            secret : process.env.SECRET_KEY
        });

        const user = await this.usersService.getUserAndRoles(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found or invalid token');
        }

        return user;
    }
}