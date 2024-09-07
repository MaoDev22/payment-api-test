import { Controller, Post, UseGuards, HttpCode } from '@nestjs/common';

import { JwtAuthGuard } from '@app/modules/auth/jwt-auth.guard';
import { Roles } from '@app/common/decorators/roles.decorator';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { ROLES } from '@app/common/constants/roles.constants';

@Controller('auth')
export class AuthController {

  @Post('validate-token')
  @Roles(ROLES.ADMIN, ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  async validate() {
    return {
      message: "The token is valid"
    };
  }
}
