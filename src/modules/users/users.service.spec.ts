import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from '@app/modules/roles/role.entity';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';
import { ROLES } from '@app/common/constants/roles.constants';

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockRoleRepository = {
  findOne: jest.fn(),
  findByIds: jest.fn(),
};

const mockAssignedRoleRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let assignedRoleRepository: Repository<AssignedRole>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(AssignedRole),
          useValue: mockAssignedRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    assignedRoleRepository = module.get<Repository<AssignedRole>>(getRepositoryToken(AssignedRole));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    
    it('should successfully register a user', async () => {
      const role = { id: 1, name: ROLES.USER };
      const savedUser = { id: 1, ...createUserDto };

      mockRoleRepository.findOne.mockResolvedValue(role);
      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockAssignedRoleRepository.create.mockReturnValue({ user: savedUser, role });
      mockAssignedRoleRepository.save.mockResolvedValue(true);

      const result = await service.register(createUserDto);

      expect(result).toEqual(savedUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(createUserDto);
      expect(assignedRoleRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already in use', async () => {
      const role = { id: 1, name: ROLES.USER };
      mockRoleRepository.findOne.mockResolvedValue(role);
      mockUserRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if role "user" not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.register(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUserAndRoles', () => {
    it('should return user with roles', async () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };
      const roles = [{ id: 1, name: 'USER' }];
      const assignedRoles = [{ role: roles[0] }];
  
      mockUserRepository.findOne.mockResolvedValue(user);
      mockAssignedRoleRepository.find.mockResolvedValue(assignedRoles);
      mockRoleRepository.findByIds.mockResolvedValue(roles);
  
      const result = await service.getUserAndRoles(1);
  
      expect(result).toEqual({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: ['USER'],
      });
  
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'username', 'email'],
      });
      expect(assignedRoleRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['role'],
      });
      expect(roleRepository.findByIds).toHaveBeenCalledWith([1]);
    });
  
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
  
      await expect(service.getUserAndRoles(1)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'username', 'email'],
      });
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        assignedRoles: [],
      };
      const token = 'generated_token';
  
      mockJwtService.sign.mockReturnValue(token);
  
      const result = await service.login(user as User);
  
      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
    });
  });
   

  describe('findById', () => {
    it('should return user by ID', async () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return undefined if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findById(1);

      expect(result).toBeUndefined();
    });
  });

  describe('validatePasswordUser', () => {
    it('should return user if password is valid', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.validatePasswordUser('test@example.com', 'password123');

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null if password is invalid', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.validatePasswordUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });
});
