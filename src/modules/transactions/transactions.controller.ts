import { Controller, Post, HttpCode, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '@app/modules/auth/jwt-auth.guard';
import { Roles } from '@app/common/decorators/roles.decorator';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { User } from '@app/modules/users/user.entity';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { WebhookEventDto } from './dto/webhook-response.dto';

import { ROLES } from '@app/common/constants/roles.constants';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService,
    ) {}

    @Post('/')
    @Roles(ROLES.ADMIN, ROLES.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(201)
    async createTransaction(@Body() payload: CreateTransactionDto, @Req() req: Request) {
        const user = req.user as User;

        if (!user) {
            throw new Error('User not found');
        }

        return await this.transactionsService.createTransaction(payload, user);
    }

    @Post('/webhook')
    @HttpCode(200)
    async updateTransaction(@Body() payload: WebhookEventDto) {
        return await this.transactionsService.updateTransaction(payload);
    }
}
