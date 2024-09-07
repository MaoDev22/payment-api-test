import * as bcrypt from 'bcryptjs';

import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

import { CreateUserDto, LoginDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
      ) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;
        return this.usersService.register(createUserDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.usersService.validatePasswordUser(loginDto.email, loginDto.password);
        if (!user) {
        throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
        }
        return this.usersService.login(user);
    }
}
