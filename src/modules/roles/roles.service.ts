import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '@app/modules/users/user.entity';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';
import { Role } from './role.entity';

import { ROLES } from '@app/common/constants/roles.constants';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AssignedRole)
    private readonly assignedRoleRepository: Repository<AssignedRole>,
  ) { }

  async onModuleInit() {
    await this.createDefaultRoles();
    await this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    const userRole = await this.roleRepository.findOne({ where: { name: ROLES.USER } });
    const userAdmin = await this.roleRepository.findOne({ where: { name: ROLES.USER } });

    const defaultUsers = [{
      username: 'Marlon Torres Lozano',
      email: 'marlon@gmail.com',
      password: 'semeolvido',
      role: userRole
    },
    {
      username: 'Default admin',
      email: 'admin@gmail.com',
      password: 'semeolvido',
      role: userAdmin
    }];

    for (const defaultUser of defaultUsers) {
      const userExists = await this.userRepository.findOne({ where: { email: defaultUser.email } });

      if (!userExists) {
        const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

        const userCreated = this.userRepository.create({
          username: defaultUser.username,
          email: defaultUser.email,
          password: hashedPassword
        });

        const savedUser = await this.userRepository.save(userCreated);

        const assignedRole = this.assignedRoleRepository.create({
          user: savedUser,
          role: userRole,
        });

        await this.assignedRoleRepository.save(assignedRole);
      }
    }
  }

  private async createDefaultRoles() {
    const defaultRoles = ['admin', 'manager', 'editor', 'user'];

    for (const roleName of defaultRoles) {
      const roleExists = await this.roleRepository.findOne({ where: { name: roleName } });

      if (!roleExists) {
        const role = this.roleRepository.create({ name: roleName });
        await this.roleRepository.save(role);
      }
    }
  }
}