import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, LoginDto } from './dto/user.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            register: jest.fn(),
            validatePasswordUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should register a user with a hashed password', async () => {
      const createUserDto: CreateUserDto = { username: "Marlon Torres Lozano", email: 'test@test.com', password: 'password123' };
      const hashedPassword = 'hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (usersService.register as jest.Mock).mockResolvedValue({ id: 1, ...createUserDto, password: hashedPassword });

      const result = await usersController.register(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.register).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(result).toEqual({ id: 1, ...createUserDto, password: hashedPassword });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', password: 'password123' };

      (usersService.validatePasswordUser as jest.Mock).mockResolvedValue(null);

      await expect(usersController.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.validatePasswordUser).toHaveBeenCalledWith('test@test.com', 'password123');
    });

    it('should return a valid user token on successful login', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', password: 'password123' };
      const user = { id: 1, email: 'test@test.com' };
      const token = 'valid_token';

      (usersService.validatePasswordUser as jest.Mock).mockResolvedValue(user);
      (usersService.login as jest.Mock).mockResolvedValue({ token });

      const result = await usersController.login(loginDto);

      expect(usersService.validatePasswordUser).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(usersService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ token });
    });
  });
});
