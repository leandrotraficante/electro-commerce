import { IsEmail, IsNotEmpty, IsString, IsOptional, Length, Matches, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {

    @IsEmail({}, { message: 'Email inválido' }) // Valida que sea un email válido
    @IsNotEmpty({ message: 'El email es obligatorio' }) // Obligatorio
    email: string;
    
    @IsString() // Debe ser string
    @IsNotEmpty({ message: 'La contraseña es obligatoria' }) // Obligatorio
    @Length(8, 50, { message: 'La contraseña debe tener entre 8 y 50 caracteres' }) // Longitud mínima y máxima
    @Matches(/(?=.*[a-z])/, { message: 'Debe contener al menos una letra minúscula' }) // Al menos una minúscula
    @Matches(/(?=.*[A-Z])/, { message: 'Debe contener al menos una letra mayúscula' }) // Al menos una mayúscula
    @Matches(/(?=.*\d)/, { message: 'Debe contener al menos un número' }) // Al menos un número
    password: string;
    
    @IsString() // Debe ser string
    @IsNotEmpty({ message: 'El nombre es obligatorio' }) // Obligatorio
    @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' }) // Longitud mínima y máxima
    firstName: string;

    @IsString() // Debe ser string
    @IsNotEmpty({ message: 'El apellido es obligatorio' }) // Obligatorio
    @Length(1, 100, { message: 'El apellido debe tener entre 1 y 100 caracteres' }) // Longitud mínima y máxima
    lastName: string;

    @IsString({ message: 'Debe ingresar un teléfono válido' })
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @Matches(/^\+?\d[\d\s\-()]{7,19}$/, { message: 'Teléfono inválido' })
    phone: string;
    
    @IsNumber({}, { message: 'Debe ingresar un DNI válido' })
    @IsNotEmpty({ message: 'El DNI es obligatorio' })
    @Min(1000000, { message: 'El DNI debe tener al menos 7 dígitos' })
    @Max(999999999999, { message: 'El DNI debe tener como máximo 12 dígitos' })
    dni: number;
    
    @IsString() // Debe ser string
    @IsOptional() // Opcional
    @Length(1, 100, { message: 'La dirección debe tener entre 1 y 100 caracteres' }) // Longitud máxima
    address?: string;

    @IsString() // Debe ser string
    @IsOptional() // Opcional
    @Length(1, 100, { message: 'La ciudad debe tener entre 1 y 100 caracteres' }) // Longitud máxima
    city?: string;

    @IsString() // Debe ser string
    @IsOptional() // Opcional
    @Length(1, 10, { message: 'El código postal debe tener entre 1 y 10 caracteres' }) // Longitud máxima
    postalCode?: string;

    @IsString() // Debe ser string
    @IsOptional() // Opcional
    @Length(1, 100, { message: 'El país debe tener entre 1 y 100 caracteres' }) // Longitud máxima
    country?: string;
}
