import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly username: string;

  @IsString()
  password: string;

  @IsEmail({}, { message: 'Correo electrónico no válido' })
  readonly email: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}