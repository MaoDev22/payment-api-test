import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';

import { Role } from './role.entity';
import { AssignedRole } from './assigned-role.entity';
import { User } from '@app/modules/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([AssignedRole])
  ],
  providers: [RolesService],
  exports: [RolesService],
})

export class RolesModule {}
