import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

import { CreateUserDto } from './dto/user.dto';
import { User } from './user.entity';
import { Role } from '@app/modules/roles/role.entity';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';
import { ROLES } from '@app/common/constants/roles.constants';
@Injectable()
export class UsersService {
    private logger: Logger;
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(AssignedRole)
        private readonly assignedRoleRepository: Repository<AssignedRole>,
        private readonly jwtService: JwtService,
    ) {
        this.logger = new Logger('Bootstrap');
    }

    async onModuleInit() {
        await this.createDefaultRoles();
    }

    private async createDefaultRoles() {
        const userRole = await this.roleRepository.findOne({ where: { name: ROLES.USER } });
        const userAdmin = await this.roleRepository.findOne({ where: { name: ROLES.USER } });

        if (!userRole) {
            throw new InternalServerErrorException('Rol "user" no encontrado - defaultUsers');
        }

        if (!userAdmin) {
            throw new InternalServerErrorException('Rol "admin" no encontrado - defaultUsers');
        }

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

    async register(createUserDto: CreateUserDto): Promise<User> {
        const role = await this.roleRepository.findOne({ where: { name: ROLES.USER } });

        if (!role) {
            throw new InternalServerErrorException('Rol "user" no encontrado');
        }

        const user = this.userRepository.create(createUserDto);
        try {
            const savedUser = await this.userRepository.save(user);

            const assignedRole = this.assignedRoleRepository.create({
                user: savedUser,
                role: role,
            });

            await this.assignedRoleRepository.save(assignedRole);

            return savedUser;
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Correo electrónico ya está en uso');
            }
            throw new InternalServerErrorException('Error al registrar el usuario');
        }
    }

    async findById(id: number): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email } });
    }

    async validatePasswordUser(email: string, pass: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {

            this.logger.log(`logged user: ${user.email}`);
            return user;
        }
        return null;
    }

    async getUserAndRoles(id: number): Promise<{ id: number; username: string; email: string; roles: string[] }> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'username', 'email'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const assignedRoles = await this.assignedRoleRepository.find({
            where: { user: { id } },
            relations: ['role'],
        });

        const roleIds = assignedRoles.map(assignedRole => assignedRole.role.id);

        const roles = await this.roleRepository.findByIds(roleIds);

        const roleNames = roles.map(role => role.name);

        return { id: user.id, username: user.username, email: user.email, roles: roleNames };
    }

    async login(user: User) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
