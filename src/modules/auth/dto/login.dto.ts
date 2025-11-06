import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' }) // Valida que sea un email válido
  @IsNotEmpty({ message: 'El email es obligatorio' }) // Obligatorio
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' }) // Debe ser string
  @IsNotEmpty({ message: 'La contraseña es obligatoria' }) // Obligatorio
  password: string;
}

